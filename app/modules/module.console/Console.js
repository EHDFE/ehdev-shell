/**
 * Console Module
 * @author ryan.bian
 */
import { Button, Modal } from 'antd';
import classnames from 'classnames';
import { Map, Set } from 'immutable';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import IconClose from 'react-icons/lib/fa/close';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Resizable from 're-resizable';
import Terminal from '../../components/component.original.terminal/';
import commandManager from '../../service/command';
import { actions as projectActions } from '../module.project/store';
import styles from './index.less';
import { actions } from './store';

const confirm = Modal.confirm;

class ConsoleModule extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    currentTerminalId: PropTypes.string,
    pids: PropTypes.instanceOf(Set),
    instances: PropTypes.instanceOf(Map),
    visible: PropTypes.bool,
    closeTerm: PropTypes.func,
    setActive: PropTypes.func,
    toggleVisible: PropTypes.func,
    setRootPath: PropTypes.func,
    onResize: PropTypes.func,
    stopServer: PropTypes.func,
    stopBuilder: PropTypes.func,
  };

  componentDidMount() {
    this.removeAllListeners = commandManager.addListeners({
      'console:show': () => {
        if (!this.props.visible) {
          this.props.toggleVisible();
        }
      },
      'console:hide': () => {
        if (this.props.visible) {
          this.props.toggleVisible();
        }
      },
    });
  }

  componentWillUnmount() {
    this.removeAllListeners();
  }

  handleResize = (e, direction, ref, delta) => {
    const { width, height } = this.props;
    this.props.onResize(width + delta.width, height + delta.height);
  };

  handleActive(rootPath, instance, e) {
    const target = e.target;
    const tagName = target.tagName.toLowerCase();
    if (tagName === 'g' || tagName === 'path') {
      let svgNode = target;
      while (svgNode.tagName.toLowerCase() !== 'svg') {
        svgNode = svgNode.parentElement;
      }
      if (svgNode.dataset.action === 'delete') {
        if (instance.get('running')) {
          return this.showCloseConfirm(instance);
        }
        this.props.closeTerm(rootPath);
        return;
      }
    }
    this.props.setActive(rootPath);
  }
  showCloseConfirm(instance) {
    const pid = instance.get('pid');
    const rootPath = instance.get('rootPath');
    const projectName = instance.get('projectName');
    const type = instance.get('type');
    confirm({
      title: '项目正在运行',
      content: '强制关闭，会停止运行中的服务',
      onOk: () => {
        if (type === 'server') {
          this.props.stopServer(pid, false, {
            rootPath,
            projectName,
          });
        } else if (type === 'builder') {
          this.props.stopBuilder(pid, false, {
            rootPath,
            projectName,
          });
        }
      },
    });
  }
  handleToggleProject(root) {
    if (root) {
      this.props.setRootPath(root);
    }
  }
  renderTabs() {
    const { currentTerminalId, pids, instances } = this.props;
    return (
      <aside className={styles.ConsoleModule__Tabs}>
        {instances
          .map((d, rootPath) => {
            const pid = d.get('pid');
            return (
              <button
                key={rootPath}
                className={classnames(styles.ConsoleModule__TabsButton, {
                  [styles['ConsoleModule__TabsButton--activeRunning']]:
                    rootPath === currentTerminalId && pids.has(pid),
                  [styles['ConsoleModule__TabsButton--active']]:
                    rootPath === currentTerminalId,
                  [styles['ConsoleModule__TabsButton--running']]: pids.has(pid),
                })}
                onClick={this.handleActive.bind(this, rootPath, d)}
                onDoubleClick={this.handleToggleProject.bind(this, rootPath)}
              >
                <div className={styles.ConsoleModule__TabsTitle}>
                  {d.get('projectName')}
                </div>
                <span className={styles.ConsoleModule__TabsClose}>
                  <IconClose size={18} data-action="delete" />
                </span>
              </button>
            );
          })
          .valueSeq()}
      </aside>
    );
  }

  renderTerminals() {
    const { currentTerminalId, instances, width, height, visible } = this.props;
    return (
      <section className={styles.ConsoleModule__Terminals}>
        {instances
          .map((d, rootPath) => (
            <Terminal
              width={width}
              height={height}
              key={rootPath}
              messageId={rootPath}
              pid={d.get('pid')}
              active={rootPath === currentTerminalId && visible}
            />
          ))
          .valueSeq()}
      </section>
    );
  }

  render() {
    const { className, width, height, visible, toggleVisible } = this.props;
    const resizableProps = {
      size: {
        width,
        height,
      },
      minWidth: 400,
      minHeight: 300,
      enable: {
        top: true,
        right: false,
        bottom: false,
        left: true,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: true,
      },
      onResizeStop: this.handleResize,
      className: classnames(styles['ConsoleModule__Wrap'], {
        [styles['ConsoleModule__Wrap--show']]: visible,
        [styles['ConsoleModule__Wrap--hide']]: !visible,
      }),
    };
    return (
      <div className={classnames(className, styles.ConsoleModule)}>
        <Button
          type="primary"
          icon="code"
          shape="circle"
          className={styles.ConsoleModule__FloatButton}
          onClick={toggleVisible}
        />
        <Resizable {...resizableProps}>
          {this.renderTabs()}
          {this.renderTerminals()}
        </Resizable>
      </div>
    );
  }
}

const consolePageSelector = state => state['page.console'];
const consoleSelector = createSelector(consolePageSelector, pageState => {
  return {
    currentTerminalId: pageState.get('activeId'),
    visible: pageState.get('visible'),
    width: pageState.get('width'),
    height: pageState.get('height'),
  };
});
const serviceSelector = state => state['page.project'].get('service');

const mapStateToProps = () =>
  createSelector(consoleSelector, serviceSelector, (consoleState, service) => ({
    ...consoleState,
    pids: service.get('pids'),
    instances: service.get('instances'),
  }));

const mapDispatchToProps = dispatch => ({
  closeTerm: rootPath =>
    dispatch(projectActions.service.closeService(rootPath)),
  setActive: id => dispatch(actions.setActive(id)),
  onResize: (width, height) => dispatch(actions.resize(width, height)),
  toggleVisible: () => dispatch(actions.toggleVisible()),
  setRootPath: rootPath => dispatch(projectActions.env.setRootPath(rootPath)),
  stopServer: (...args) => dispatch(projectActions.service.stopServer(...args)),
  stopBuilder: (...args) =>
    dispatch(projectActions.service.stopBuilder(...args)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConsoleModule);
