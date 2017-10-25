/**
 * Node commander executer
 */
const { spawn, exec } = require('child_process');
const { serviceStore } = require('./index');

const COMMAND_OUTPUT = 'COMMAND_OUTPUT';

module.exports = {
  /**
   * run the command
   * @param {string} commands - the commond running in terminal
   * @param {object} options
   * @param {boolean|string} options.parseResult - if true, the function will return a promise that resolve a json response.
   * @param {object} options.env - the execution environment variables
   * @param {string} options.cwd - the execution path of the command
   * @param {object} options.webContent - webContent used to communicate msg with render
   */
  run(commands, options) {
    const config = Object.assign(
      {
        parseResult: 'json',
        env: {},
        cwd: process.cwd(),
        webContent: undefined,
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
    const ps = spawn(command, args, spawnOptions);
    const { pid } = ps;
    const { webContent } = config;
    if (pid) {
      serviceStore.set(pid, ps);
    }

    const ret = new Promise((resolve, reject) => {
      let res = '';
      ps.stdout.on('data', data => {
        webContent.send(COMMAND_OUTPUT, {
          data: data.toString(),
          action: 'log',
        });
        res += data.toString();
      });
      ps.stderr.on('data', data => {
        webContent.send(COMMAND_OUTPUT, {
          data: data.toString(),
          action: 'log',
        });
        reject(data);
      });
      ps.on('error', err => {
        webContent.send(COMMAND_OUTPUT, {
          data: err.toString(),
          action: 'error',
        });
        reject(err);
        serviceStore.delete(pid);
      });
      ps.on('exit', (code, signal) => {
        webContent.send(COMMAND_OUTPUT, {
          data: {
            code,
            signal,
          },
          action: 'exit',
        });
        serviceStore.delete(pid);
        if (config.parseResult) {
          try {
            resolve(JSON.parse(res));
          } catch (e) {
            reject(e);
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
