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
    value: '',
  }
  static propTypes = {
    value: PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.resize = throttle(function(){
      this.terminal.fit();
    }.bind(this), 500);
  }
  componentDidMount() {
    this.terminal = new Terminal({
      cols: 30,
    });
    this.terminal.open(this.root);
    this.terminal.write(this.props.value);
    window.addEventListener('resize', this.resize, false);
    this.resize();
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.terminal.write(nextProps.value);
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    this.terminal.destroy();
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
