/**
 * Node commander executer
 */
// const { spawn } = require('child_process');
const { webContents } = require('electron');
const { serviceStore } = require('./index');
const WebSocket = require('ws');
const { platform } = require('os');
const pty = require('node-pty');

const HOST = platform() === 'win32' ? '127.0.0.1' : '0.0.0.0';
const PORT = 8484;

class Commander {
  constructor() {
    this.ws = {};
    this.socketServer = new WebSocket.Server({
      host: HOST,
      port: PORT,
    });
    this.socketServer.on('connection', (ws, req) => {
      const id = decodeURIComponent(req.url.replace(/^\//, ''));
      this.ws[id] = ws;
      ws.on('close', () => {
        delete this.ws[id];
      });
      ws.on('message', data => {
        const resizeConfig = JSON.parse(data);
        this.resize(resizeConfig.pid, resizeConfig.cols, resizeConfig.rows);
      });
    });
  }
  send(id, data) {
    if (this.ws[id]) {
      this.ws[id].send(data);
    }
  }
  resize(pid, cols, rows) {
    const currentProcess = serviceStore.get(pid);
    if (currentProcess) {
      currentProcess.resize(cols, rows);
    }
  }
  /**
   * run the command
   * @param {string} commands - the commond running in terminal
   * @param {object} options
   * @param {boolean|string} options.parseResult - if true, the function will return a promise that resolve a json response.
   * @param {object} options.env - the execution environment variables
   * @param {string} options.cwd - the execution path of the command
   * @param {boolean} options.useCnpm - use cnpm's mirror as registry
   * @param {string} options.category - pass to client for ui usage
   * @param {object} options.args - arguments to passthrough
   */
  run(commands, options) {
    const { SHELL_CONTENT_ID } = process.env;
    const webContent = webContents.fromId(+SHELL_CONTENT_ID);
    const config = Object.assign(
      {
        parseResult: 'json',
        env: {},
        cwd: process.cwd(),
        useCnpm: true,
        category: 'OTHER',
        args: {},
      },
      options
    );
    const [command, ...args] = commands.split(/\s+/);
    const spawnOptions = {
      cwd: config.cwd,
      env: Object.assign({}, process.env, config.env, {
        FORCE_COLOR: true,
      }),
      shell: true,
    };
    let runtimeArgs;
    if (command === 'npm') {
      runtimeArgs = config.useCnpm
        ? args.concat('--registry=https://registry.npm.taobao.org')
        : args.concat('--registry=https://registry.npmjs.org/');
    } else {
      runtimeArgs = args;
    }
    const ps = pty.spawn(command, runtimeArgs, spawnOptions);
    // const ps = pty.spawn(shell, runtimeArgs, spawnOptions);
    const { pid } = ps;
    serviceStore.set(pid, ps);

    const ret = new Promise((resolve, reject) => {
      let wholeText = '';
      ps.on('data', data => {
        if (config.parseResult) {
          wholeText += data;
        } else {
          this.send(config.cwd, data);
        }
      });
      ps.on('exit', code => {
        serviceStore.delete(pid);
        if (config.parseResult) {
          if (config.parseResult === 'json') {
            try {
              resolve(!wholeText ? {} : JSON.parse(wholeText));
            } catch (e) {
              reject(e.toString());
            }
          } else {
            resolve(wholeText);
          }
        } else {
          webContent.send('SERVICE_STOPPED', {
            pid,
            rootPath: config.cwd,
          });
          webContent.send(`COMMAND_EXIT:${pid}`);
        }
      });
    });
    if (config.parseResult) {
      return ret;
    } else {
      return Promise.resolve({
        pid,
      });
    }
  }
}

module.exports = new Commander();
