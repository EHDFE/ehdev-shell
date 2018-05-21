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

const { app, dialog, webContents } = require('electron');
const Raven = require('raven');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const pkg = require('../app/package.json');

if (process.env.NODE_ENV === 'production') {
  Raven.config('https://d2e7d99b1c414fe0ab0b02b67f17c1c8:d24b5c31a1a24020a73333fef1c306ab@sentry.io/247420', {
    release: pkg.version,
  }).install();
}

// Autoupdater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

function sendStatusToWindow(msg) {
  log.info(msg);
  const webContentList = webContents.getAllWebContents();
  webContentList.map(w => {
    w.send('update-download-progress', msg);
  });
}

autoUpdater.on('update-available', info => {
  dialog.showMessageBox({
    type: 'info',
    title: '更新提示',
    message: `发现可用更新: v${info.version}，点击更新下载?`,
    buttons: ['更新', '忽略']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: '安装更新',
    message: '更新包下载完成，重启并安装...'
  }, () => {
    log.info('update-downloaded');
    setImmediate(() => autoUpdater.quitAndInstall());
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  const log_message = [
    `Download speed: ${progressObj.bytesPerSecond}`,
    `Downloaded  ${progressObj.percent}%`,
    `${progressObj.transferred}/${progressObj.total}`,
  ];
  log.info(`download-progress: ${progressObj.percent}`);
  sendStatusToWindow(log_message.join('\r'));
});

app.on('ready', function()  {
  autoUpdater.checkForUpdatesAndNotify();
});

// context menu
require('electron-context-menu')();

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}
