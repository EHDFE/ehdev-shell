const { app, shell, Menu } = require('electron');
const pkg = require('../package.json');

class MenuController {
  constructor() {
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
    if (process.env.NODE_DEV === 'development') {
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
}

module.exports = MenuController;
