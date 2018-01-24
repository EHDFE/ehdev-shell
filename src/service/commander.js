/**
 * Node commander executer
 */
const { spawn } = require('child_process');
const { serviceStore } = require('./index');
const { webContents } = require('electron');

const COMMAND_OUTPUT = 'COMMAND_OUTPUT';

module.exports = {
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
    const ps = spawn(command, runtimeArgs, spawnOptions);
    const { pid } = ps;
    const webContentArray = webContents.getAllWebContents();
    if (pid) {
      serviceStore.set(pid, ps);
    }

    const ret = new Promise((resolve, reject) => {
      let res;
      if (config.parseResult === 'json') {
        res = Buffer.from('');
      }
      ps.stdout.on('data', data => {
        webContentArray.forEach(webContent => {
          webContent && webContent.send(COMMAND_OUTPUT, {
            dataBuffer: data,
            pid,
            action: 'log',
            category: config.category,
            args: config.args,
            root: config.cwd,
          });
        });
        if (config.parseResult === 'json') {
          res = Buffer.concat([res, data]);
        }
      });
      ps.stderr.on('data', data => {
        webContentArray.forEach(webContent => {
          webContent && webContent.send(COMMAND_OUTPUT, {
            dataBuffer: data,
            pid,
            action: 'log',
            category: config.category,
            args: config.args,
            root: config.cwd,
          });
        });
      });
      ps.on('error', err => {
        webContentArray.forEach(webContent => {
          webContent && webContent.send(COMMAND_OUTPUT, {
            data: err.toString(),
            pid,
            action: 'error',
            category: config.category,
            args: config.args,
            root: config.cwd,
          });
        });
        reject(err);
        serviceStore.delete(pid);
      });
      ps.on('exit', (code, signal) => {
        webContentArray.forEach(webContent => {
          webContent && webContent.send(COMMAND_OUTPUT, {
            data: {
              code,
              signal,
            },
            pid,
            action: 'exit',
            category: config.category,
            args: config.args,
            root: config.cwd,
          });
        });
        serviceStore.delete(pid);
        if (config.parseResult === 'json') {
          try {
            resolve(res.toString() === '' ? {} : JSON.parse(res.toString()));
          } catch (e) {
            reject(res.toString());
          }
        }
      });
    });
    if (config.parseResult) {
      return ret;
    } else {
      return {
        pid,
      };
    }
  },
};
