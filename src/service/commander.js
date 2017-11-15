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
   * @param {boolean} options.useCnpm - use cnpm's mirror as registry
   */
  run(commands, options) {
    const config = Object.assign(
      {
        parseResult: 'json',
        env: {},
        cwd: process.cwd(),
        webContent: undefined,
        useCnpm: true,
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
    if (config.useCnpm && command === 'npm') {
      runtimeArgs = args.concat('--registry=https://registry.npm.taobao.org');
    } else {
      runtimeArgs = args;
    }
    const ps = spawn(command, runtimeArgs, spawnOptions);
    const { pid } = ps;
    const { webContent } = config;
    if (pid) {
      serviceStore.set(pid, ps);
    }

    ps.stdout.pipe(process.stdout);
    ps.stderr.pipe(process.stderr);

    const ret = new Promise((resolve, reject) => {
      let res = Buffer.from('');
      ps.stdout.on('data', data => {
        webContent.send(COMMAND_OUTPUT, {
          data: data.toString(),
          pid,
          action: 'log',
        });
        res = Buffer.concat([res, data]);
      });
      ps.stderr.on('data', data => {
        webContent.send(COMMAND_OUTPUT, {
          data: data.toString(),
          pid,
          action: 'log',
        });
        res = Buffer.concat([res, data]);
      });
      ps.on('error', err => {
        webContent.send(COMMAND_OUTPUT, {
          data: err.toString(),
          pid,
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
          pid,
          action: 'exit',
        });
        serviceStore.delete(pid);
        if (config.parseResult) {
          if (config.parseResult === 'json') {
            try {
              resolve(res.toString() === '' ? {} : JSON.parse(res.toString()));
            } catch (e) {
              reject(res.toString());
            }
          } else {
            resolve(res.toString());
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
