const { app, BrowserWindow } = require('electron');
const path = require('path');

const APP_CONFIG = require('./CONFIG');

let win;

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const shouldQuit = app.makeSingleInstance((otherInstArgv, otherInstWorkingDir) => {
  if (win !== null) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

if (shouldQuit) app.quit();

function createWindow() {
  require('./src/index');
  win = new BrowserWindow(Object.assign(APP_CONFIG.BROWSER_CONFIG, {
    width: APP_CONFIG.WIDTH,
    height: APP_CONFIG.HEIGHT,
    minWidth: APP_CONFIG.MIN_WIDTH,
    minHeight: APP_CONFIG.MIN_HEIGHT,
  }));
  win.loadURL('http://localhost:3000');

  // if (process.env.NODE_ENV === 'development') {
  // }
  win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}


app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});
