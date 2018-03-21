const platform = require('os').platform();
const { Tray, Menu, nativeImage } = require('electron');

let iconPath;
if (platform === 'darwin') {
  iconPath = require.resolve('./assets/tray.png');
} else if (platform === 'win32') {
  iconPath = require.resolve('./assets/tray.ico');
}

class TrayController {
  constructor() {
    const trayImage = nativeImage.createFromPath(iconPath);
    trayImage.setTemplateImage(true);
    this.tray = new Tray(trayImage);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Item1', type: 'radio' },
      { label: 'Item2', type: 'radio' },
      { label: 'Item3', type: 'radio', checked: true },
      { label: 'Item4', type: 'radio' },
    ]);
    this.tray.setToolTip('This is my application.');
    this.tray.setContextMenu(contextMenu);
  }
}

module.exports = TrayController;
