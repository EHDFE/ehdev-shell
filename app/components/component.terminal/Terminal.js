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
  get terminal() {
    if (!this._terminal) {
      return this.getTerminalInstance();
    }
    return this._terminal;
  }
  componentDidMount() {
    this.socket = new WebSocket(`ws://0.0.0.0:8484/${encodeURIComponent(this.props.messageId)}`);
    this.socket.addEventListener('open', () => {
      setTimeout(() => {
        this.terminal.attach(this.socket, false, true);
      }, 0);
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.width !== this.props.width || nextProps.height !== this.props.height) {
      setTimeout(() => {
        this.terminal && this.terminal.fit();
      }, 100);
    }
  }
  componentWillUnmount() {
    this.terminal.detach(this.socket);
    this.socket.close();
    this.terminal && this.terminal.destroy();
  }
  getTerminalInstance() {
    this._terminal = new Terminal({
      enableBold: true,
      fontSize: 14,
      lineHeight: 1.2,
      fontFamily: process.platform === 'darwin' ? DEFAULT_MAC_FONT_FAMILY : DEFAULT_WINDOWS_FONT_FAMILY,
      // cancelEvents: true,
      // disableStdin: true,
    });
    this._terminal.on('resize', size => {
      this.emitResize(size);
    });
    this._terminal.open(this.root, false);
    // this.terminal.winptyCompatInit();
    this._terminal.webLinksInit();
    this._terminal.fit();
    return this._terminal;
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
