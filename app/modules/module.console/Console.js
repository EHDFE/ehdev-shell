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
import { Badge, Button } from 'antd';

import { actions } from './store';

import styles from './index.less';
import Console from '../../components/component.console/';

const COMMAND_OUTPUT = 'COMMAND_OUTPUT';
const LogBuffer = {};

class ConsoleModule extends PureComponent {
  static propTypes = {
    id: PropTypes.number,
    logList: PropTypes.array,
    content: PropTypes.string,
    visible: PropTypes.bool,
    createLog: PropTypes.func,
    deleteLog: PropTypes.func,
    setActive: PropTypes.func,
    toggleVisible: PropTypes.func,
  }

  componentDidMount() {
    const decoder = new TextDecoder();
    ipcRenderer.on(COMMAND_OUTPUT, (event, arg) => {
      if (arg.action === 'log' || arg.action === 'error') {
        const { pid, dataBuffer, category } = arg;
        const log = decoder.decode(dataBuffer).replace(/\n/g, '\r\n');
        LogBuffer[`${pid}_timer`] && clearTimeout(LogBuffer[`${pid}_timer`]);
        Object.assign(LogBuffer, {
          [pid]: LogBuffer[pid] ? LogBuffer[pid] + log : log,
          [`${pid}_timer`]: setTimeout(() => {
            this.dispatchLog(pid, category);
          }, 100),
        });
      }
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(COMMAND_OUTPUT);
  }

  dispatchLog(pid, category) {
    const log = LogBuffer[pid];
    this.props.createLog(pid, category, log);
    delete LogBuffer[pid];
    delete LogBuffer[`${pid}_timer`];
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
  renderTabs() {
    const { id, logList } = this.props;
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
              } else {
                icon = <IconTerminal size={18} />;
              }
              return (
                <li
                  key={d.id}
                  className={
                    classnames(
                      styles.ConsoleModule__TabsItem,
                      {
                        [styles['ConsoleModule__TabsItem--active']]: d.id === id,
                      },
                    )
                  }
                >
                  <Badge
                    dot={!d.checked}
                  >
                    <button
                      className={
                        classnames(
                          styles.ConsoleModule__TabsButton,
                          styles[`ConsoleModule__TabsButton--${d.category.toLowerCase()}`],
                        )
                      }
                      onClick={this.handleActive.bind(this, d.id)}
                    >
                      {icon}
                      <div className={styles.ConsoleModule__TabsTitle}>
                        {d.id}
                      </div>
                      <IconClose size={18} data-action="delete" />
                    </button>
                  </Badge>
                </li>
              );
            })
          }
        </ul>
      </aside>
    );
  }

  render() {
    const { id, visible, content, toggleVisible } = this.props;
    return (
      <div className={styles.ConsoleModule}>
        <Button
          type="primary"
          icon="code"
          className={styles.ConsoleModule__FloatButton}
          onClick={toggleVisible}
        />
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
      logList: pageState.ids.map(id => pageState.entities[id]).sort((a, b) => (b.updateTime - a.updateTime)),
      content: pageState.activeId ? pageState.entities[pageState.activeId].content : null,
      visible: pageState.visible,
    };
  }
);

const mapStateToProps = (state) => createSelector(
  consoleSelector,
  consoleState => consoleState,
);

const mapDispatchToProps = dispatch => ({
  createLog: (pid, category, content) => dispatch(actions.createLog(pid, category, content)),
  deleteLog: id => dispatch(actions.deleteLog(id)),
  setActive: id => dispatch(actions.activeLog(id)),
  toggleVisible: () => dispatch(actions.toggleVisible()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConsoleModule);
