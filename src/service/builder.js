/**
 * Builder Service
 * @author ryan.bian
 */
const Commander = require('./commander');

module.exports = (rootPath, webContent) => {
  return Commander.run('ls -la', {
    cwd: rootPath,
    commandName: 'Builder',
    stdio: true,
    json: false,
    webContent,
  });
};
