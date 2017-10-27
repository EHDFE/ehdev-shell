/** child_service utils
 * @author ryan.bian
 */
const path = require('path');
const SHELL_NODE_MODULES_PATH = process.env.SHELL_NODE_MODULES_PATH;

// webpack path
exports.Webpack = require(path.join(SHELL_NODE_MODULES_PATH, 'webpack'));
exports.WebpackDevServer = require(path.join(SHELL_NODE_MODULES_PATH, 'webpack-dev-server'));

// project paths
const PROJECT_ROOT = exports.PROJECT_ROOT = process.cwd();

// configer info
const ConfigerFolder = process.argv[2].split('=')[1];
const ConfigerName = process.argv[3].split('=')[1];
const ConfigPath = path.join(ConfigerFolder, `node_modules/${ConfigerName}`);

let port;
if (process.argv[4]) {
  port = + process.argv[4].split('=')[1];
}
// dev server port
exports.PORT = port ? port : 3000;

const projectConfig = require(`${PROJECT_ROOT}/abc.json`);
const { DEFAULT_PROJECT_CONFIG, getDevConfig, getProdConfig } = require(ConfigPath);

// project config
exports.projectConfig = Object.assign({}, DEFAULT_PROJECT_CONFIG, projectConfig);
exports.getDevConfig = getDevConfig;
exports.getProdConfig = getProdConfig;
