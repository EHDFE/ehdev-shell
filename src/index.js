/**
 * backend starter
 * @author ryan.bian
 */
const path = require('path');

const devMode = process.env.NODE_ENV === 'development';

if (devMode) {
  const PATH_APP_NODE_MODULES = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(PATH_APP_NODE_MODULES);
}

// const { app, dialog, webContents } = require('electron');
const Raven = require('raven-js');
// const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const pkg = require('../app/package.json');

if (process.env.NODE_ENV === 'production') {
  Raven.config('https://d2e7d99b1c414fe0ab0b02b67f17c1c8@sentry.io/247420', {
    release: pkg.version,
  }).install();
}

// Autoupdater
// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'info';
log.info('Jarvis starting...');

// context menu
require('electron-context-menu')();

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}
