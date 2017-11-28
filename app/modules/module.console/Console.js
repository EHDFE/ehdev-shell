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

import { Popover, Button } from 'antd';

import { actions } from './store';

import styles from './index.less';
import Console from '../../components/component.console/';

const COMMAND_OUTPUT = 'COMMAND_OUTPUT';

class ConsoleModule extends PureComponent {

  static propTypes = {
    content: PropTypes.string,
    lastLogContent: PropTypes.string,
    lastLogTime: PropTypes.number,
    visible: PropTypes.bool,
    updateLog: PropTypes.func,
    clear: PropTypes.func,
    toggleVisible: PropTypes.func,
  }

  componentDidMount() {
    ipcRenderer.on(COMMAND_OUTPUT, (event, arg) => {
      if (arg.action === 'log' || arg.action === 'error') {
        const log = arg.data.replace(/\n/g, '\r\n');
        this.props.updateLog(log);
      }
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(COMMAND_OUTPUT);
  }

  clearTerminal = () => {
    this.props.clear();
    this.con.clearTerminal();
  }

  render() {
    const { visible, content, lastLogContent, lastLogTime, toggleVisible } = this.props;
    return (
      <div className={styles.Console}>
        <Popover
          content={
            <button
              className={styles.Console__MenuBtn}
              onClick={this.clearTerminal}
            >
              清除日志
            </button>
          }
          placement="bottomRight"
          title={'控制台'}
          trigger="hover"
        >
          <Button
            type="primary"
            icon="code"
            className={styles['hover-btn']}
            onClick={toggleVisible}
          />
        </Popover>
        <div
          className={
            classnames(
              styles['console-wrap'],
              {
                [styles['console-wrap__show']]: visible,
                [styles['console-wrap__hide']]: !visible,
              }
            )
          }
        >
          <Console
            defaultValue={content}
            value={lastLogContent}
            updateTimeStamp={lastLogTime}
            ref={con => (this.con = con)}
          />
        </div>
      </div>
    );
  }
}

const consolePageSelector = state => state['page.console'];
const consoleSelector = createSelector(
  consolePageSelector,
  pageState => ({
    content: pageState.content,
    lastLogContent: pageState.lastLog.content,
    lastLogTime: pageState.lastLog.t,
    visible: pageState.visible,
  })
);

const mapStateToProps = (state) => createSelector(
  consoleSelector,
  consoleState => consoleState,
);

const mapDispatchToProps = dispatch => ({
  clear: () => dispatch(actions.clean()),
  updateLog: data => dispatch(actions.updateLog(data)),
  toggleVisible: () => dispatch(actions.toggleVisible()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConsoleModule);
