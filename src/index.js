/**
 * backend starter
 * @author ryan.bian
 */
const Raven = require('raven');
const fixPath = require('fix-path');
const autoUpdater = require('electron-updater').autoUpdater;
const log = require('electron-log');

Raven.config(
  process.env.NODE_ENV === 'production' &&
  'https://d2e7d99b1c414fe0ab0b02b67f17c1c8:d24b5c31a1a24020a73333fef1c306ab@sentry.io/247420'
).install();

// FIX PATH
fixPath();

// Autoupdater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

autoUpdater.checkForUpdatesAndNotify();

// context menu
require('electron-context-menu')();

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}


