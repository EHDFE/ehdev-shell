const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

class UpdaterManager {
  constructor() {
    this.autoUpdater = autoUpdater;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
  }
  async checkForUpdate() {
    try {
      const updateInfo = await autoUpdater.checkForUpdates();
      this.cancellationToken = updateInfo.cancellationToken;
      return updateInfo;
    } catch (e) {
      throw e;
    }
  }
  downloadUpdate() {
    autoUpdater.downloadUpdate(this.cancellationToken);
  }
  // cancelUpdate(CancellationToken) {
  //   this.cancellationToken.cancel();
  // }
  install() {
    autoUpdater.quitAndInstall();
  }
}

module.exports = new UpdaterManager();
