/**
 * Env
 * @author ryan.bian
 */
const path = require('path');
const { app } = require('electron');
const { platform } = require('os');

let APP_PATH;
if (process.env.NODE_ENV === 'production') {
  APP_PATH = app.getAppPath().replace(/app\.asar\/?$/, 'app.asar.unpacked');
} else {
  APP_PATH = app.getAppPath();
}
exports.APP_PATH = APP_PATH;

// userData path
const UserDataPath = exports.UserDataPath = app.getPath('userData');
// configs's folder
const ConfigerFolderPath = exports.ConfigerFolderPath = path.join(UserDataPath, 'configs');
// configs's package.json path
exports.ConfigerFolderPackagePath = path.join(ConfigerFolderPath, 'package.json');

exports.SHELL_NODE_MODULES_PATH = path.join(APP_PATH, 'node_modules');

exports.isWindows = platform() === 'win32';
