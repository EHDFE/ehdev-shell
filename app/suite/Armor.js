const { app } = require('electron');
const getUnixShellEnvironment = require('./util/fix-path');
const { isMac, isDEV } = require('./util/env');

if (isDEV) {
  require('../../src/index');
} else {
  require('../main-build/index');
}

const CONFIG = require('./CONFIG');
const Core = require('./Core');
const MenuController = require('./equipment/Menu');
const TrayController = require('./equipment/Tray');

class Armor {
  constructor() {
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      app.quit();
      return;
    } else {
      app.on('second-instance', () => {
        if (this.core.window) {
          if (this.core.window.isMinimized()) {
            this.core.window.restore();
          }
          this.core.window.focus();
        }
      });
    }
    this.willLoadCore()
      .then(() => {
        app.on('ready', () => {
          this.beforeLoadCore()
            .then(() => {
              this.loadCore();
              this.addEquipment(MenuController);
              this.addEquipment(TrayController);
            });
        });
      }).catch(core => {
        core.show().focus();
        app.quit();
      });
    app.on('before-quit', this.beforeQuit.bind(this));
    app.on('will-quit', this.willQuit.bind(this));
    app.on('activate', this.willActiviate.bind(this));
    app.on('window-all-closed', () => {
      app.quit();
    });
  }
  willLoadCore() {
    if (this.core) return Promise.reject(this.core);
    return Promise.resolve();
  }
  beforeLoadCore() {
    return new Promise(resolve => {
      if (isMac) {
        getUnixShellEnvironment().then(shellEnv => {
          Object.assign(process.env, shellEnv);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  loadCore() {
    this.equipments = [];
    const coreConfig = Object.assign(CONFIG.BROWSER_CONFIG, {
      width: CONFIG.WIDTH,
      height: CONFIG.HEIGHT,
      minWidth: CONFIG.MIN_WIDTH,
      minHeight: CONFIG.MIN_HEIGHT,
      show: isDEV,
    });
    this.core = new Core(coreConfig);
    if (isDEV) {
      const port = CONFIG.DEV_PORT;
      this.core.loadURL(`http://localhost:${port}`);
    } else {
      const url = require('url');
      const pagePath = url.format({
        protocol: 'file',
        slashes: true,
        pathname: require('path').join(__dirname, '../dist/index.html'),
      });
      this.core.loadURL(pagePath);
    }
  }
  beforeQuit(event) {
    this.equipments.forEach(instance => {
      instance.destroy();
    });
  }
  willQuit() {
    setTimeout(() => {
      app.exit();
    }, 500);
  }
  willActiviate() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (this.core.getWindow() === null) {
      this.loadCore();
    } else {
      this.core.show();
    }
  }
  addEquipment(Equipment) {
    const equipment = new Equipment({
      core: this.core,
    });
    this.equipments.push(equipment);
    return equipment;
  }
}

module.exports = Armor;

