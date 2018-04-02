const platform = require('os').platform();
const { Tray, nativeImage } = require('electron');

let iconPath;
if (platform === 'darwin') {
  iconPath = require.resolve('../assets/tray.png');
} else if (platform === 'win32') {
  iconPath = require.resolve('../assets/tray.ico');
}

class TrayController {
  constructor(context) {
    this.core = context.core;
    const trayImage = nativeImage.createFromPath(iconPath);
    trayImage.setTemplateImage(true);
    this.tray = new Tray(trayImage);
    this.automate();
  }
  automate() {
    this.tray.on('click', () => {
      this.core.toggle();
    });
  }
}

module.exports = TrayController;
