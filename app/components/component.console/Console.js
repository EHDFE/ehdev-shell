/**
 * Console Component
 * @author ryan.bian
 */
import React, { Component } from 'react';
import throttle from 'lodash/throttle';
import Terminal from 'xterm';
import PropTypes from 'prop-types';
import 'xterm/lib/xterm.css';

import styles from './index.less';

Terminal.loadAddon('fit');

export default class Console extends Component {
  static defaultProps = {
    defaultValue: '',
    value: '',
    updateTimeStamp: undefined,
  }
  static propTypes = {
    defaultValue: PropTypes.string,
    value: PropTypes.string,
    updateTimeStamp: PropTypes.number,
  }
  constructor(props) {
    super(props);
    this.resize = throttle(function() {
      this.terminal.fit();
    }.bind(this), 500);
  }
  componentDidMount() {
    this.terminal = new Terminal({
      cols: 30,
    });
    this.terminal.open(this.root);
    this.terminal.writeln(this.props.defaultValue);
    window.addEventListener('resize', this.resize, false);
    this.resize();
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.updateTimeStamp !== nextProps.updateTimeStamp) {
      this.terminal.write(nextProps.value);
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    this.terminal.destroy();
  }
  clearTerminal() {
    this.terminal.clear();
  }
  render() {
    return (
      <div
        className={styles.Console__Wrapper}
        ref={node => this.root = node}
      />
    );
  }
}
