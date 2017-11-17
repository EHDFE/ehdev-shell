/**
 * Console Module
 * @author ryan.bian
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { ipcRenderer } from 'electron';
import classnames from 'classnames';

import { Popover, Button } from 'antd';

import { actions } from './store';

import styles from './index.less';
import Console from '../../components/component.console/';

class ConsoleModule extends Component {

  static propTypes = {
    content: PropTypes.string,
    lastLogContent: PropTypes.string,
    lastLogTime: PropTypes.number,
    updateLog: PropTypes.func,
    clear: PropTypes.func,
  }

  state = {
    isShow: null,
  }

  componentDidMount() {
    const COMMAND_OUTPUT = 'COMMAND_OUTPUT';
    ipcRenderer.on(COMMAND_OUTPUT, (event, arg) => {
      if (arg.action === 'log' || arg.action === 'error') {
        const log = arg.data.replace(/\n/g, '\r\n');
        this.props.updateLog(log);
      }
    });
  }

  consoleToggle = () => {
    this.setState({
      isShow: !this.state.isShow,
    });
  }

  clearTerminal = () => {
    this.props.clear();
    this.con.clearTerminal();
  }

  render() {
    const { content, lastLogContent, lastLogTime } = this.props;

    return (
      <div className={styles.Console}>
        <Popover
          content={
            <Button
              className={styles['clear-terminal']}
              onClick={this.clearTerminal}
            >
              清除日志
            </Button>
          }
          placement="bottomRight"
          title={'控制台'}
          trigger="hover"
        >
          <Button
            type="primary"
            icon="code"
            className={styles['hover-btn']}
            onClick={this.consoleToggle}
          />
        </Popover>
        <div
          className={
            classnames(
              styles['console-wrap'],
              {
                [styles['console-wrap__show']]: this.state.isShow,
                [styles['console-wrap__hide']]: !this.state.isShow,
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
    lastLogTime: pageState.lastLog.t
  })
);

const mapStateToProps = (state) => createSelector(
  consoleSelector,
  consoleState => consoleState,
);

const mapDispatchToProps = dispatch => ({
  clear: () => dispatch(actions.clean()),
  updateLog: data => dispatch(actions.updateLog(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConsoleModule);
