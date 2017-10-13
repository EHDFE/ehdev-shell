const { app, BrowserWindow, Menu, shell } = require('electron');
const fp = require('find-free-port');

const pkg = require('./package.json');
const APP_CONFIG = require('./CONFIG');

require('electron-context-menu')();

let win;

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

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
  if (process.env.NODE_ENV === 'development') {
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
  // find available port between 3100 to 3200
  fp(3100, 3200, (err, freePort) => {
    if (err) throw Error(err);

    require('./src/index')(freePort);
    win = new BrowserWindow(
      Object.assign(APP_CONFIG.BROWSER_CONFIG, {
        width: APP_CONFIG.WIDTH,
        height: APP_CONFIG.HEIGHT,
        minWidth: APP_CONFIG.MIN_WIDTH,
        minHeight: APP_CONFIG.MIN_HEIGHT,
      })
    );
    win.loadURL(`http://localhost:${freePort}`);

    if (process.env.NODE_ENV === 'development') {
      win.webContents.openDevTools();
    }

    win.on('closed', () => {
      win = null;
    });

    // config menu
    setupMenu();
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
