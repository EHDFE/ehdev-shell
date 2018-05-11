/**
 * Terminal Component
 * @author ryan.bian
 */
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as search from 'xterm/lib/addons/search/search';
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks';
import * as attach from 'xterm/lib/addons/attach/attach';
// import * as attach from './addons/attach';
import 'xterm/lib/xterm.css';
import styles from './index.less';

const DEFAULT_WINDOWS_FONT_FAMILY = 'Consolas, \'Courier New\', monospace';
const DEFAULT_MAC_FONT_FAMILY = 'Menlo, Monaco, \'Courier New\', monospace';

Terminal.applyAddon(fit);
Terminal.applyAddon(attach);
Terminal.applyAddon(webLinks);
Terminal.applyAddon(search);

export default class TerminalComponent extends PureComponent {
  static defaultProps = {
    className: '',
    width: undefined,
    height: undefined,
    pid: undefined,
    messageId: undefined,
    active: false,
  }
  static propTypes = {
    className: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    pid: PropTypes.number,
    messageId: PropTypes.string,
    active: PropTypes.bool,
  }
  componentDidMount() {
    this.socket = new WebSocket(`ws://0.0.0.0:8484/${this.props.messageId}`);
    this.socket.addEventListener('open', () => {
      this.getTerminalInstance()
        .then(terminal => {
          terminal.attach(this.socket, false, true);
        });
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.width !== this.props.width || nextProps.height !== this.props.height) {
      setTimeout(() => {
        this.terminal && this.terminal.fit();
      }, 0);
    }
  }
  componentWillUnmount() {
    this.terminal.detach(this.socket);
    this.socket.close();
    this.terminal && this.terminal.destroy();
  }
  getTerminalInstance() {
    if (!this.terminal) {
      return new Promise(resolve => {
        this.terminal = new Terminal({
          // cursorBlink: false,
          // scrollback: 3000,
          enableBold: true,
          fontSize: 14,
          lineHeight: 1.2,
          fontFamily: process.platform === 'darwin' ? DEFAULT_MAC_FONT_FAMILY : DEFAULT_WINDOWS_FONT_FAMILY,
          // cancelEvents: true,
          // disableStdin: true,
        });
        this.terminal.on('resize', size => {
          this.emitResize(size);
          // setTimeout(() => {
          //   this.terminal.fit();
          // }, 500);
        });
        this.terminal.open(this.root, false);
        // this.terminal.winptyCompatInit();
        this.terminal.webLinksInit();
        this.terminal.fit();
        resolve(this.terminal);
      });
    }
    return Promise.resolve(this.terminal);
  }
  emitResize(size) {
    const { pid } = this.props;
    this.socket.send(JSON.stringify({
      pid,
      cols: size.cols,
      rows: size.rows,
    }));
  }
  clearTerminal() {
    this.terminal.clear();
  }
  render() {
    const { className, width, height, active } = this.props;
    return (
      <div
        style={{
          width,
          height,
        }}
        className={classnames(
          className,
          styles.Terminal__Wrapper,
          {
            [styles['Terminal__Wrapper--active']]: active,
          }
        )}
        ref={node => this.root = node}
      />
    );
  }
}
