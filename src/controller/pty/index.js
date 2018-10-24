/**
 * Pty Controller
 * @author ryan bian
 */
const EventEmitter = require('events');
const path = require('path');
const pty = require('node-pty');
const { defaults } = require('lodash');
const { getDefaultShell } = require('../../utils/');
const { isWindows } = require('../../utils/env');

const defaultPtyOptions = {
  cwd: process.env.HOME,
  env: process.env,
  cols: 80,
  rows: 30,
};

class PTY extends EventEmitter {
  constructor(options = {}) {
    super();
    this.init(options);
  }
  init(options) {
    defaults(options, defaultPtyOptions);
    const shell = getDefaultShell();
    let shellName;
    if (isWindows) {
      shellName = path.basename(shell);
    } else {
      shellName = 'xterm-256color';
    }
    try {
      this.process = pty.spawn(shell, [], {
        name: shellName,
        ...options,
      });
    } catch (error) {
      this._exitCode = 2;
      this.exit();
      return;
    }
    this.process.on('data', data => {
      this.emit('data', data);
      if (this._closeTimeout) {
        clearTimeout(this._closeTimeout);
        this.exit();
      }
    });
    this.process.on('exit', code => {
      this._exitCode = code;
      this.exit();
    });
    PTY.pool.set(this.process.pid, this);
  }
  print(data) {
    this.emit('data', data);
  }
  write(data) {
    this.process.write(data);
  }
  resize(cols, rows) {
    this.process.resize(Math.max(cols, 1), Math.max(rows, 1));
  }
  kill() {
    // Attempt to kill the pty, it may have already been killed at this
    // point but we want to make sure
    const pid = this.process.pid;
    try {
      this.process.kill();
    } catch (ex) {
      // Swallow, the pty has already been killed
    } finally {
      PTY.pool.delete(pid);
    }
  }
  exit() {
    if (this._closeTimeout) {
      clearTimeout(this._closeTimeout);
    }
    return new Promise(resolve => {
      this._closeTimeout = setTimeout(() => {
        this.removeAllListeners();
        this.kill();
        resolve(true);
      }, 250);
    });
  }
}

PTY.pool = new Map();

module.exports = PTY;
