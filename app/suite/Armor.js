const { app, BrowserWindow, ipcMain } = require('electron');
const getUnixShellEnvironment = require('./util/fix-path');

const isDEV = process.env.NODE_ENV === 'development';

if (isDEV) {
  require('../../src/index');
} else {
  require('./engine');
}

const CONFIG = require('./CONFIG');
const MenuController = require('./menu');
const TrayController = require('./Tray');

class Armor {
  constructor() {
    this.equipments = [];
    const shouldQuit = app.makeSingleInstance(
      (otherInstArgv, otherInstWorkingDir) => {
        if (this.mainWindow !== null) {
          if (this.mainWindow.isMinimized()) {
            this.mainWindow.restore();
          }
          this.mainWindow.focus();
        }
      }
    );
    if (shouldQuit) {
      app.quit();
    } else {
      this.init();
    }
  }
  startUp() {
    this.mainWindow = new BrowserWindow(
      Object.assign(CONFIG.BROWSER_CONFIG, {
        width: CONFIG.WIDTH,
        height: CONFIG.HEIGHT,
        minWidth: CONFIG.MIN_WIDTH,
        minHeight: CONFIG.MIN_HEIGHT,
        show: isDEV,
        // vibrancy: 'medium-light',
        webPreferences: {
          webSecurity: false,
        },
      })
    );
    const { webContents } = this.mainWindow;

    if (isDEV) {
      const port = CONFIG.DEV_PORT;
      this.mainWindow.loadURL(`http://localhost:${port}`);
    } else {
      this.mainWindow.loadURL(require('url').format({
        protocol: 'file',
        slashes: true,
        pathname: require('path').join(__dirname, 'dist/index.html'),
      }));

      webContents.on('did-finish-load', () => {
        if (!this.mainWindow) {
          throw new Error('"mainWindow" is not defined');
        }
        this.mainWindow.show();
        this.mainWindow.focus();
      });
    }

    ['unresponsive'].forEach(eventName => {
      this.mainWindow.on(eventName, e => {
        webContents.send(`APP:${eventName}`);
      });
    });

    this.mainWindow.on('close', e => {
      e.preventDefault();
      webContents.send('APP_WILL_CLOSE');
      ipcMain.once('SERVICE:stop-all-done', () => {
        this.mainWindow.destroy();
      });
      // stop all services before close
      ipcMain.emit('SERVICE:req-stop-all');
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    this.addEquipment(MenuController);
    this.addEquipment(TrayController);
  }
  didReady() {
    if (process.platform === 'darwin') {
      getUnixShellEnvironment().then(shellEnv => {
        Object.assign(process.env, shellEnv);
        this.startUp();
      }).catch(err => {
        this.startUp();
      });
    } else {
      this.startUp();
    }
  }
  willQuit() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }
  willActiviate() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (this.win === null) {
      this.startUp();
    }
  }
  init() {
    app.on('ready', this.didReady.bind(this));
    app.on('window-all-closed', this.willQuit.bind(this));
    app.on('activate', this.willActiviate.bind(this));
  }
  addEquipment(Equipment) {
    this.equipments.push(new Equipment());
  }
  close() {
    if (!this.mainWindow) return;
    this.mainWindow.close();
  }
}

module.exports = Armor;

