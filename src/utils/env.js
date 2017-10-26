/**
 * Env
 * @author ryan.bian
 */
const path = require('path');
const { app } = require('electron');

// userData path
const UserDataPath = exports.UserDataPath = app.getPath('userData');
// configs's folder
const ConfigerFolderPath = exports.ConfigerFolderPath = path.join(UserDataPath, 'configs');
// configs's package.json path
const ConfigerFolderPackagePath = exports.ConfigerFolderPackagePath = path.join(ConfigerFolderPath, 'package.json');

const WebpackPath = exports.WebpackPath = require.resolve('webpack');
const WebpackDevServerPath = exports.WebpackDevServerPath = require.resolve('webpack-dev-server');
