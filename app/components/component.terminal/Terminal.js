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
import * as winptyCompat from 'xterm/lib/addons/winptyCompat/winptyCompat';
// import * as attach from './addons/attach';
import 'xterm/lib/xterm.css';
import styles from './index.less';

const DEFAULT_WINDOWS_FONT_FAMILY = 'Consolas, \'Courier New\', monospace';
const DEFAULT_MAC_FONT_FAMILY = 'Menlo, Monaco, \'Courier New\', monospace';

Terminal.applyAddon(fit);
Terminal.applyAddon(attach);
Terminal.applyAddon(webLinks);
Terminal.applyAddon(search);
Terminal.applyAddon(winptyCompat);

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
    if (!this.opened && this.props.active) {
      this.open(this._terminal, true);
    }
    return this._terminal;
  }
  componentDidMount() {
    this.socket = new WebSocket(`ws://localhost:8484/${encodeURIComponent(this.props.messageId)}`);
    this.socket.addEventListener('open', () => {
      this.terminal.attach(this.socket, false, true);
    });
  }
  componentDidUpdate(prevProps) {
    if (prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
      if (this.props.active) {
        this.fit(this.terminal, true);
      }
    } else if (this.props.active && !prevProps.active) {
      this.fit(this.terminal, true);
    }
  }
  componentWillUnmount() {
    this.terminal.detach(this.socket);
    this.socket.close();
    this.terminal && this.terminal.dispose();
  }
  getTerminalInstance() {
    const { active } = this.props;
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
    if (active) {
      setTimeout(() => {
        this.open(this._terminal);
      }, 500);
    }
    this._terminal.winptyCompatInit();
    this._terminal.webLinksInit();
    return this._terminal;
  }
  open(terminal, needMeasure) {
    terminal.open(this.root, false);
    this.fit(terminal, needMeasure);
    this.opened = true;
  }
  fit(terminal, needMeasure) {
    if (this.props.active) {
      setTimeout(() => {
        needMeasure && terminal.charMeasure.measure(terminal.options);
        terminal.fit();
      }, 500);
    }
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
