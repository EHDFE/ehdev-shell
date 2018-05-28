/**
 * Node commander executer
 */
// const { spawn } = require('child_process');
const { webContents } = require('electron');
const { serviceStore } = require('./index');
const WebSocket = require('ws');
const { platform } = require('os');
const { promisify } = require('util');
const pty = require('node-pty');
const { findExecutable } = require('../utils/');
const { isWindows } = require('../utils/env');
const { execFile } = require('child_process');

const HOST = isWindows ? '127.0.0.1' : '0.0.0.0';
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
    this.socketServer.on('error', err => {
      // console.error(err);
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
   * @param {boolean} options.outputToTermnal
   */
  async run(commands, options) {
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
        outputToTermnal: false,
      },
      options,
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
    if (!config.outputToTermnal) {
      // use execFile
      if (config.parseResult) {
        return new Promise((resolve, reject) => {
          const ps = execFile(command, runtimeArgs, {
            cwd: spawnOptions.cwd,
            env: spawnOptions.env,
            shell: true,
          }, (err, stdout, stderr) => {
            // if (err) {
            //   return reject(err);
            // }
            let data;
            try {
              data = JSON.parse(stdout);
            } catch (e) {
              data = {};
            }
            resolve(data);
          });
          serviceStore.set(ps.pid, ps);
          ps.on('exit', () => {
            serviceStore.delete(ps.pid);
          });
        });
      } else {
        const ps = execFile(command, runtimeArgs, {
          cwd: spawnOptions.cwd,
          env: spawnOptions.env,
          shell: true,
        });
        serviceStore.set(ps.pid, ps);
        ps.on('exit', () => {
          webContent.send(`COMMAND_EXIT:${ps.pid}`);
          serviceStore.delete(ps.pid);
        });
        return {
          pid: ps.pid,
        };
      }
    } else {
      // use winPty
      let executableCommand;
      if (isWindows) {
        executableCommand = findExecutable(command, config.cwd, {
          env: spawnOptions.env,
        });
      } else {
        executableCommand = command;
      }
      const ps = pty.spawn(executableCommand, runtimeArgs, spawnOptions);
      // const ps = pty.spawn(shell, runtimeArgs, spawnOptions);
      const { pid } = ps;
      serviceStore.set(pid, ps);

      let wholeText = '';
      ps.on('data', data => {
        this.send(config.cwd, data);
      });
      ps.on('exit', code => {
        serviceStore.delete(pid);
        webContent.send('SERVICE_STOPPED', {
          pid,
          rootPath: config.cwd,
        });
        webContent.send(`COMMAND_EXIT:${pid}`);
      });

      return { pid };
    }
  }
}

module.exports = new Commander();
