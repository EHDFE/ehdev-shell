/**
 * console
 * @author ryan.bian
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { ipcRenderer } from 'electron';
import Terminal from 'xterm';

import { Popover, Button } from 'antd';

import { actions } from './store';

import styles from './index.less';
import Console from '../../components/component.console/';
const term = new Terminal();
class ConsoleModule extends Component {
  state = {
    isShow: null
  }
  propTypes = {
    service: PropTypes.object,
    updateLog: PropTypes.func
  }
  componentDidMount() {
    const COMMAND_OUTPUT = 'COMMAND_OUTPUT';
    ipcRenderer.on(COMMAND_OUTPUT, (event, arg) => {
      if (arg.action === 'log' || arg.action === 'error') {
        const log = arg.data.replace(/\n/g, '\r\n');
        this.props.updateLog(log + '\r\n');
      }
    });
  }

  consoleToggle() {
    this.setState({
      isShow: !this.state.isShow
    });
  }

  clearTerminal() {
    term.clearSelection();
  }

  render() {
    const { service } = this.props;
    const content = 'SHOW/HIDE CONSOLE';

    return (
      <div className={styles.Console}>
        <Popover content={content} trigger="hover">
          <Button type="primary" icon="code" className={styles['hover-btn']} onClick={this.consoleToggle.bind(this)}></Button>
        </Popover>
        <div className={`${styles['console-wrap']} ${this.state.isShow ? styles['console-wrap__show']: ''}  ${this.state.isShow === false ? styles['console-wrap__hide']: ''}`}>
          <Console value={service.log}/>
        </div>
      </div>
    );
  }
}

const consolePageSelector = state => {
  return state['page.console'];
};


const serviceSelector = createSelector(
  consolePageSelector,
  pageState => pageState.service,
);

const mapStateToProps = (state) => createSelector(
  serviceSelector,
  (service) => ({
    service,
  }),
);
const mapDispatchToProps = dispatch => ({
  updateLog: data => dispatch(actions.service.updateLog(data))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConsoleModule);
