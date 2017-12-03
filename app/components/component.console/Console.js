/**
 * Console Component
 * @author ryan.bian
 */
import { PureComponent } from 'react';
import classnames from 'classnames';
import throttle from 'lodash/throttle';
import Terminal from 'xterm';
import PropTypes from 'prop-types';
import 'xterm/lib/xterm.css';

import styles from './index.less';

Terminal.loadAddon('fit');

export default class Console extends PureComponent {
  static defaultProps = {
    className: '',
    id: null,
    value: '',
  }
  static propTypes = {
    className: PropTypes.string,
    id: PropTypes.number,
    value: PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.resize = throttle(function() {
      this.terminal.fit();
      this.clearTerminal();
      this.writeContent(this.props);
    }.bind(this), 500, {
      leading: false,
    });
  }
  componentDidMount() {
    this.terminal = new Terminal({
      cursorBlink: false,
    });
    this.terminal.open(this.root, false);
    setTimeout(() => {
      this.writeContent(this.props);
      this.terminal.fit();
    }, 500);
    window.addEventListener('resize', this.resize, false);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.id !== nextProps.id || this.props.value !== nextProps.value) {
      this.clearTerminal();
      this.writeContent(nextProps);
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    this.terminal.destroy();
  }
  writeContent(props) {
    props.value && this.terminal.write(props.value);
  }
  clearTerminal() {
    this.terminal.clear();
  }
  render() {
    const { className } = this.props;
    return (
      <div
        className={classnames(className, styles.Console__Wrapper)}
        ref={node => this.root = node}
      />
    );
  }
}
