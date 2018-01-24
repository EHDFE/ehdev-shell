/**
 * Console Module
 * @author ryan.bian
 */
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { ipcRenderer } from 'electron';
import classnames from 'classnames';
import IconPlay from 'react-icons/lib/fa/play-circle-o';
import IconBuild from 'react-icons/lib/fa/codepen';
import IconTerminal from 'react-icons/lib/fa/terminal';
import IconClose from 'react-icons/lib/fa/close';
import { Badge, Button, Popover } from 'antd';

import { actions } from './store';
import { actions as projectActions } from '../module.project/store';

import styles from './index.less';
import Console from '../../components/component.console/';

const COMMAND_OUTPUT = 'COMMAND_OUTPUT';
const LogBuffer = {};

class ConsoleModule extends PureComponent {
  static propTypes = {
    id: PropTypes.number,
    logList: PropTypes.array,
    content: PropTypes.string,
    pids: PropTypes.array,
    visible: PropTypes.bool,
    createLog: PropTypes.func,
    deleteLog: PropTypes.func,
    setActive: PropTypes.func,
    toggleVisible: PropTypes.func,
    setRootPath: PropTypes.func,
  }

  state = {
    size: 'normal',
    sizeControlVisible: false,
  }

  componentDidMount() {
    const decoder = new TextDecoder();
    ipcRenderer.on(COMMAND_OUTPUT, (event, data) => {
      if (data.action === 'log' || data.action === 'error') {
        const { pid, dataBuffer, category, args, root } = data;
        const log = decoder.decode(dataBuffer).replace(/\n/g, '\r\n');
        LogBuffer[`${pid}_timer`] && clearTimeout(LogBuffer[`${pid}_timer`]);
        Object.assign(LogBuffer, {
          [pid]: LogBuffer[pid] ? LogBuffer[pid] + log : log,
          [`${pid}_timer`]: setTimeout(() => {
            this.dispatchLog(pid, category, args, root);
          }, 100),
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible && this.props.visible) {
      this.setState({
        sizeControlVisible: false,
      });
    }
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(COMMAND_OUTPUT);
  }

  dispatchLog(pid, category, args, root) {
    const log = LogBuffer[pid];
    this.props.createLog(pid, category, log, args, root);
    delete LogBuffer[pid];
    delete LogBuffer[`${pid}_timer`];
  }

  handleToggleSize = () => {
    const { size } = this.state;
    this.setState({
      size: size === 'normal' ? 'large' : 'normal',
    });
  }

  handleMouseEnter = () => {
    if (this.props.visible) {
      this.hideTimer && clearTimeout(this.hideTimer);
      this.setState({
        sizeControlVisible: true,
      });
    }
  }
  handleMouseLeave = () => {
    if (this.props.visible) {
      this.hideTimer && clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => {
        this.setState({
          sizeControlVisible: false,
        });
      }, 500);
    }
  }

  handleActive(id, e) {
    const target = e.target;
    const tagName = target.tagName.toLowerCase();
    if (tagName === 'g' || tagName === 'path') {
      let svgNode = target;
      while (svgNode.tagName.toLowerCase() !== 'svg') {
        svgNode = svgNode.parentElement;
      }
      if (svgNode.dataset.action === 'delete') {
        this.props.deleteLog(id);
        return;
      }
    }
    this.props.setActive(id);
  }
  handleToggleProject(root, e) {
    if (root) {
      this.props.setRootPath(root);
    }
  }
  renderTabs() {
    const { id, logList, pids } = this.props;
    return (
      <aside className={styles.ConsoleModule__Tabs}>
        <ul className={styles.ConsoleModule__TabsList}>
          {
            logList.map(d => {
              let icon;
              if (d.category === 'SERVER') {
                icon = <IconPlay size={18} />;
              } else if (d.category === 'BUILD' || d.category === 'DLL_BUILD') {
                icon = <IconBuild size={18} />;
              }
              return (
                <li
                  key={d.id}
                  className={
                    classnames(
                      styles.ConsoleModule__TabsItem,
                      {
                        [styles['ConsoleModule__TabsItem--active']]: d.id === id,
                        [styles['ConsoleModule__TabsItem--stoped']]: !pids.includes(d.id),
                      },
                    )
                  }
                >
                  <Badge
                    dot={!d.checked && pids.includes(d.id)}
                  >
                    <button
                      className={
                        classnames(
                          styles.ConsoleModule__TabsButton,
                          styles[`ConsoleModule__TabsButton--${d.category.toLowerCase()}`],
                        )
                      }
                      onClick={this.handleActive.bind(this, d.id)}
                      onDoubleClick={this.handleToggleProject.bind(this, d.root)}
                    >
                      {icon}
                      <IconClose size={18} data-action="delete" />
                      <div className={styles.ConsoleModule__TabsTitle}>
                        <span className={styles['ConsoleModule__TabsTitle--content']}>
                          {d.projectName || d.id}
                        </span>
                      </div>
                    </button>
                  </Badge>
                </li>
              );
            })
          }
        </ul>
        <div className={styles['ConsoleModule__Tabs--fixed']}>
          <button
            className={
              classnames(
                styles.ConsoleModule__TabsButton,
                styles['ConsoleModule__TabsButton--other'],
              )
            }
            onClick={() => {
              this.props.setActive(0);
            }}
          >
            <IconTerminal size={18} />
          </button>
        </div>
      </aside>
    );
  }

  renderSizeControl() {
    const { size } = this.state;
    let icon;
    if (size === 'normal') {
      icon = 'arrows-alt';
    } else {
      icon = 'shrink';
    }
    return (
      <Button
        type="dashed"
        icon={icon}
        onClick={this.handleToggleSize}
        onMouseEnter={this.handleMouseEnter}
      />
    );
  }

  render() {
    const { id, visible, content, toggleVisible } = this.props;
    const { size, sizeControlVisible } = this.state;
    return (
      <div className={styles.ConsoleModule}>
        <Popover
          placement="left"
          content={this.renderSizeControl()}
          trigger="hover"
          visible={sizeControlVisible}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          <Button
            type="primary"
            icon="code"
            shape="circle"
            className={styles.ConsoleModule__FloatButton}
            onClick={toggleVisible}
          />
        </Popover>
        <div
          className={
            classnames(
              styles['ConsoleModule__Wrap'],
              {
                [styles['ConsoleModule__Wrap--show']]: visible,
                [styles['ConsoleModule__Wrap--hide']]: !visible,
              }
            )
          }
        >
          { this.renderTabs() }
          <Console
            className={styles.ConsoleModule__Content}
            id={id}
            value={content}
            ref={con => (this.con = con)}
            visible={visible}
            size={size}
          />
        </div>
      </div>
    );
  }
}

const consolePageSelector = state => state['page.console'];
const consoleSelector = createSelector(
  consolePageSelector,
  pageState => {
    return {
      id: pageState.activeId,
      logList: pageState.ids.map(id => pageState.entities[id])
        .filter(d => d.category !== 'OTHER')
        .sort((a, b) => (b.updateTime - a.updateTime)),
      content: Number.isInteger(pageState.activeId) ? pageState.entities[pageState.activeId].content : null,
      visible: pageState.visible,
    };
  }
);
const projectSelector = state => state['page.project'];
const pidsSelector = createSelector(projectSelector, projectState => projectState.service.pids || []);

const mapStateToProps = (state) => createSelector(
  consoleSelector,
  pidsSelector,
  (consoleState, pids) => ({
    ...consoleState,
    pids,
  }),
);

const mapDispatchToProps = dispatch => ({
  createLog: (pid, category, content, args, root) => dispatch(actions.createLog(pid, category, content, args, root)),
  deleteLog: id => dispatch(actions.deleteLog(id)),
  setActive: id => dispatch(actions.activeLog(id)),
  toggleVisible: () => dispatch(actions.toggleVisible()),
  setRootPath: rootPath => dispatch(projectActions.env.setRootPath(rootPath)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConsoleModule);
