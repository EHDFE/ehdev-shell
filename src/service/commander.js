/**
 * Node commander executer
 */
const { spawn, exec } = require('child_process');
const { serviceStore } = require('./index');

module.exports = {
  /**
   * run the command
   * @param {string} commands - the commond running in terminal
   * @param {object} options
   * @param {string} options.commandName - the name of current command used in ipcMain.
   * @param {boolean} options.json - if true, the function will return a promise that resolve a json response.
   * @param {boolean} options.stdio - if true, the funtion will return an object which has pid of current process.
   * @param {object} options.env - the execution environment variables
   * @param {string} options.cwd - the execution path of the command
   * @param {object} options.webContent - webContent used to communicate msg with render
   */
  run(commands, options) {
    const config = Object.assign({
      commandName: undefined,
      json: true,
      stdio: false,
      env: {},
      cwd: process.cwd(),
      webContent: undefined,
    }, options);
    const [ command, ...args ] = commands.split(/\s+/);
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
    const commandName = config.commandName || [command, pid].join(':');
    if (pid) {
      serviceStore.set(pid, ps);
    }

    if (config.json) {
      return new Promise((resolve, reject) => {
        let res = '';
        ps.stdout.on('data', data => {
          res += data.toString();
        });
        ps.stderr.on('data', data => {
          reject(data);
        });
        ps.on('error', err => {
          reject(err);
          serviceStore.delete(pid);
        });
        ps.on('close', code => {
          try {
            resolve(JSON.parse(res));
          } catch (e) {
            reject(e);
          }
          serviceStore.delete(pid);
        });
      });
    } else if (config.stdio) {
      ps.stdout.on('data', data => {
        webContent.send(`${commandName}:${pid}`, {
          data: data.toString(),
          action: 'log',
        });
      });
      ps.stderr.on('data', data => {
        webContent.send(`${commandName}:${pid}`, {
          data: data.toString(),
          action: 'log',
        });
      });
      ps.on('error', err => {
        webContent.send(`${commandName}:${pid}`, {
          data: err.toString(),
          action: 'stop',
        });
        serviceStore.delete(pid);
      });
      ps.on('close', code => {
        webContent.send(`${commandName}:${pid}`, {
          data: code,
          action: 'stop',
        });
        serviceStore.delete(pid);
      });
      return {
        pid,
        commandName,
      };
    }
  }
};
