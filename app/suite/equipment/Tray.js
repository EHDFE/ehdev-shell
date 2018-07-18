const { Tray, nativeImage } = require('electron');
const { isMac } = require('../util/env');

let iconPath;
if (isMac) {
  iconPath = require.resolve('../assets/tray.png');
} else {
  iconPath = require.resolve('../assets/origin.white.png');
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
  destroy() {
    this.tray.destroy();
  }
}

module.exports = TrayController;
