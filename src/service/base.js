/**
 * Service Base Class
 */
const { spawn } = require('child_process');

class ServiceStore {
  constructor() {
    this.store = new Map();
  }
  set(pid, service) {
    this.store.set(pid, service);
  }
  get(pid) {
    this.store.get(pid);
  }
  has(pid) {
    return this.store.has(pid);
  }
  delete(pid) {
    this.store.delete(pid);
  }
}

class Service {
  /**
   * @param {string} root - project's directory
   * @param {string} type - project's type
   * @param {object} config - project's configuration
   * @param {object} webContent - WebContent instance
   * @param {object} store - ServiceStore instance
   */
  constructor(root, type, config, webContent, store) {
    this.processOptions = {
      cwd: root,
      env: Object.assign({}, process.env, {
        // make chalk works correctly
        FORCE_COLOR: true,
      }),
    };
    this.command = 'ehdev';
    this.args = ['server'];
    this.webContent = webContent;
    this.store = store;
  }
  /**
   * start service
   */
  start() {
    this.ps = spawn(this.command, this.args, this.processOptions);
    this.registStdioListener();
    return {
      pid: this.ps.pid,
    };
  }
  /**
   * kill service
   */
  kill() {
    if (!this.ps.killed) {
      this.ps.kill('SIGTERM');
    }
  }
  /**
   * listen on stdio when process started
   */
  registStdioListener() {
    const pid = this.ps.pid;
    this.ps.on('error', err => {
      this.webContent.send(`${this.serviceName}:${pid}`, {
        action: 'stop',
      });
      this.store.delete(pid);
    });
    this.ps.stdout.on('data', data => {
      this.webContent.send(`${this.serviceName}:${pid}`, {
        data: data.toString(),
        action: 'log',
      });
    });
    this.ps.stderr.on('data', data => {
      this.webContent.send(`${this.serviceName}:${pid}`, {
        data: data.toString(),
        action: 'log',
      });
    });
    this.ps.on('close', code => {
      this.webContent.send(`${this.serviceName}:${pid}`, {
        action: 'stop',
      });
      this.store.delete(pid);
    });
  }
}

exports.ServiceStore = ServiceStore;
exports.Service = Service;
