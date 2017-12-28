const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const isDEV = process.env.NODE_ENV === 'development';

if (isDEV) {
  require('../src/index');
} else {
  require('./main-build/index');
}

const pkg = require('./package.json');
const APP_CONFIG = require('./MAIN_CONFIG');

let win;

const shouldQuit = app.makeSingleInstance(
  (otherInstArgv, otherInstWorkingDir) => {
    if (win !== null) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  }
);

function setupMenu() {
  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' },
      ],
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'close' }],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal(pkg.homepage);
          },
        },
        {
          label: 'Release Notes',
          click() {
            shell.openExternal(
              'https://github.com/EHDFE/ehdev-shell/releases'
            );
          },
        },
        {
          label: 'Report Issues',
          click() {
            shell.openExternal(pkg.bugs.url);
          },
        },
        { type: 'separator' },
        { role: 'toggledevtools' },
      ],
    },
  ];
  if (isDEV) {
    template[0].submenu.unshift({
      role: 'reload',
    }, {
      role: 'forcereload',
    }, {
      type: 'separator'
    });
  }
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }
  // menu config
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

if (shouldQuit) app.quit();

function createWindow() {
  win = new BrowserWindow(
    Object.assign(APP_CONFIG.BROWSER_CONFIG, {
      width: APP_CONFIG.WIDTH,
      height: APP_CONFIG.HEIGHT,
      minWidth: APP_CONFIG.MIN_WIDTH,
      minHeight: APP_CONFIG.MIN_HEIGHT,
      show: isDEV,
      webPreferences: {
        webSecurity: false,
      },
    })
  );
  if (isDEV) {
    const port = process.env.PORT || 1212;
    win.loadURL(`http://localhost:${port}`);
  } else {
    win.loadURL(require('url').format({
      protocol: 'file',
      slashes: true,
      pathname: require('path').join(__dirname, 'dist/index.html'),
    }));
  }

  if (!isDEV) {
    win.webContents.on('did-finish-load', () => {
      if (!win) {
        throw new Error('"win" is not defined');
      }
      win.show();
      win.focus();
    });
  }

  win.on('close', e => {
    e.preventDefault();
    ipcMain.once('SERVICE:stop-all-done', () => {
      win.destroy();
    });
    // stop all services before close
    ipcMain.emit('SERVICE:req-stop-all');
  });

  win.on('closed', () => {
    win = null;
  });

  exports.closeWindow = () => {
    win.close();
  };

  // config menu
  setupMenu();
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
