const { promisify } = require('util');
const execFile = promisify(require('child_process').execFile);
const { defaults } = require('lodash');

const defaultOptions = {
  cwd: process.env.HOME,
  env: process.env,
  parseResult: false,
};

module.exports = async (commands, options = {}, callback = () => {}) => {
  defaults(options, defaultOptions);
  const [command, ...args] = commands.split(/\s+/);
  const { stdout, stderr } = await execFile(command, args, {
    cwd: options.cwd,
    env: options.env,
    shell: true,
  });
  callback(stdout || stderr);
  let result;
  if (options.parseResult) {
    try {
      result = JSON.parse(stdout);
    } catch (e) {
      result = {};
    }
    return result;
  }
  return stdout;
};
