const { BrowserWindow, ipcMain, app } = require('electron');

const isDEV = process.env.NODE_ENV === 'development';

const HANDLERS = new Map([
  [
    'CORE:BEFORE_CLOSE:REPLY', function(e, instances) {
      if (Object.keys(instances).map(p => instances[p]).filter(d => d.running).length > 0 || this.serviceStore.store.size > 0) {
        this.send('CORE:SERVICE_NOT_END');
      } else {
        this.window.destroy();
      }
    }
  ],
  [
    'CORE:SERVICE_NOT_END:CLOSE', function(e) {
      this.serviceStore.stopAllService()
        .then(resList => {
          // give renderer some times to update state
          setTimeout(() => {
            app.quit();
          }, 500);
        }).catch(err => {
          if (typeof err === 'string') {
            this.send('CORE:CLOSE_SERVICE_FAILED', err);
          } else {
            this.send('CORE:CLOSE_SERVICE_FAILED', err.message || err.toString());
          }
        });
    }
  ]
]);

class Core {
  constructor(config) {
    this.window = new BrowserWindow(config);
    this.webContents = this.window.webContents;
    process.env.SHELL_CONTENT_ID = this.webContents.id;
    this.webContents.on('did-finish-load', () => {
      this.show().focus();
    });
    this.window.on('unresponsive', () => {
      this.send('CORE:UNRESPONSIVE');
    });
    this.window.on('close', this.beforeClose);
    this.window.on('closed', () =>{
      this.destroy();
    });

    let apiService;
    if (isDEV) {
      apiService = require('../../src/apiService');
    } else {
      apiService = require('../main-build/apiService');
    }

    this.serviceStore = apiService.serviceStore;

    this.registHandlers();
  }
  registHandlers() {
    HANDLERS.forEach((handler, CHANNEL) => {
      ipcMain.on(CHANNEL, handler.bind(this));
    });
  }
  getWindow() {
    return this.window;
  }
  getContents() {
    return this.webContents;
  }
  loadURL(url) {
    this.window.loadURL(url);
  }
  send(channel, ...args) {
    this.webContents.send(channel, ...args);
  }
  beforeClose(e) {
    e.preventDefault();
    this.send('CORE:BEFORE_CLOSE');
  }
  toggle() {
    if (this.window.isVisible()) {
      this.window.hide();
    } else {
      this.window.show();
    }
  }
  show() {
    if (this.window.isMinimized()) {
      this.window.restore();
    }
    if (!this.window.isVisible()) {
      this.window.show();
    }
    return this;
  }
  hide() {
    this.window.hide();
    return this;
  }
  focus() {
    this.window.focus();
    return this;
  }
  destroy() {
    this.window = null;
  }
}

module.exports = Core;
