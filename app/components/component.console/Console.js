/**
 * Console Component
 * @author ryan.bian
 */
import { PureComponent } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import 'xterm/lib/xterm.css';

const DEFAULT_WINDOWS_FONT_FAMILY = 'Consolas, \'Courier New\', monospace';
const DEFAULT_MAC_FONT_FAMILY = 'Menlo, Monaco, \'Courier New\', monospace';

import styles from './index.less';

Terminal.applyAddon(fit);

export default class Console extends PureComponent {
  static defaultProps = {
    className: '',
    id: null,
    value: '',
    visible: false,
    size: 'normal',
  }
  static propTypes = {
    className: PropTypes.string,
    id: PropTypes.number,
    value: PropTypes.string,
    visible: PropTypes.bool,
    size: PropTypes.oneOf(['normal', 'large']),
  }
  componentDidMount() {
    if (this.props.visible) {
      this.writeContent(this.props);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.id !== nextProps.id || this.props.value !== nextProps.value) {
      this.writeContent(nextProps);
    } else {
      if (!this.props.visible && nextProps.visible) {
        this.writeContent(nextProps);
      }
    }
    if (this.props.size !== nextProps.size) {
      setTimeout(() => {
        this.terminal && this.terminal.fit();
        this.writeContent(nextProps);
      }, 0);
    }
  }
  componentWillUnmount() {
    this.terminal && this.terminal.destroy();
  }
  getTerminalInstance() {
    if (!this.terminal) {
      return new Promise(resolve => {
        setTimeout(() => {
          this.terminal = new Terminal({
            cursorBlink: false,
            scrollback: 3000,
            enableBold: true,
            fontSize: 14,
            lineHeight: 1.2,
            fontFamily: process.platform === 'darwin' ? DEFAULT_MAC_FONT_FAMILY : DEFAULT_WINDOWS_FONT_FAMILY,
            cancelEvents: true,
            disableStdin: true,
          });
          this.terminal.open(this.root);
          this.terminal.fit();
          resolve(this.terminal);
        }, 500);
      });
    }
    return this.terminal;
  }
  async writeContent(props) {
    if (props.value && props.visible) {
      this.terminal = await this.getTerminalInstance();
      this.terminal.clear();
      this.terminal.write(props.value);
    }
  }
  clearTerminal() {
    this.terminal.clear();
  }
  render() {
    const { className, size } = this.props;
    return (
      <div
        className={classnames(
          className,
          styles.Console__Wrapper,
          styles[`Console__Wrapper--${size}`],
        )}
        ref={node => this.root = node}
      />
    );
  }
}
