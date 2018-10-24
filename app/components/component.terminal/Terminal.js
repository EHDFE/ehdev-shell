/**
 * Terminal Component
 * @author ryan bian
 */
import { PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';
import { Terminal as Xterm } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as search from 'xterm/lib/addons/search/search';
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks';
import * as winptyCompat from 'xterm/lib/addons/winptyCompat/winptyCompat';
import classnames from 'classnames';
import 'xterm/lib/xterm.css';

import TERMINAL_API from '../../apis/terminal';
import EnvUtils from '../../utils/env';
import styles from './index.less';

Xterm.applyAddon(fit);
Xterm.applyAddon(search);
Xterm.applyAddon(webLinks);
Xterm.applyAddon(winptyCompat);

const DEFAULT_WINDOWS_FONT_FAMILY = "Consolas, 'Courier New', monospace";
const DEFAULT_MAC_FONT_FAMILY = "Menlo, Monaco, 'Courier New', monospace";

export default class Terminal extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    disableStdin: PropTypes.bool,
    height: PropTypes.number,
    pid: PropTypes.number,
  };
  static defaultProps = {
    className: '',
    height: 100,
    disableStdin: false,
  };
  static remoteInit() {
    const pty = TERMINAL_API.initialize();
    return pty;
  }
  static getPtyByPid(pid) {
    return TERMINAL_API.getInstance(pid) || TERMINAL_API.initialize();
  }
  node = createRef();
  componentDidMount() {
    this.init();
    this.ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === this.node.current) {
          this.term.fit();
        }
      }
    });
    this.ro.observe(this.node.current);
  }
  componentWillUnmount() {
    this.ro.disconnect(this.node.current);
    this.dispose();
  }
  init() {
    const { disableStdin, pid } = this.props;
    this.term = new Xterm({
      fontSize: 13,
      fontFamily: EnvUtils.isMac
        ? DEFAULT_MAC_FONT_FAMILY
        : DEFAULT_WINDOWS_FONT_FAMILY,
      disableStdin,
    });
    this.term.open(this.node.current);
    if (pid) {
      this.pty = Terminal.getPtyByPid(pid);
    } else {
      this.pty = Terminal.remoteInit();
    }
    this.pty.on('data', data => {
      this.term.write(data);
    });
    this.term.on('data', data => {
      this.pty.write(data);
    });
    this.term.on('resize', ({ cols, rows }) => {
      this.pty.resize(cols, rows);
    });
    this.term.fit();
  }
  dispose() {
    this.term.dispose();
    this.pty.exit();
  }
  render() {
    return (
      <div
        style={{
          height: this.props.height,
        }}
        className={classnames(styles.Terminal__Container, this.props.className)}
        ref={this.node}
      />
    );
  }
}
