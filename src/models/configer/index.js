/**
 * Configer Model
 * @author ryan.bian
 */
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const Commander = require('../../service/commander');
const { hasDir, hasFile, mkdir } = require('../../utils/');

const UserDataPath = app.getPath('userData');
const ConfigerFolderPath = path.join(UserDataPath, 'configs');
const ConfigerFolderPackagePath = path.join(ConfigerFolderPath, 'package.json');
const initFolder = () => {
  hasFile(ConfigerFolderPackagePath).catch(() => {
    Commander.run('npm init --yes', {
      cwd: ConfigerFolderPath,
    });
  });
};
hasDir(ConfigerFolderPath).then(() => {
  initFolder();
}).catch(() => {
  mkdir(ConfigerFolderPath)
    .then(() => {
      initFolder();
    });
});

class ConfigerAPI {
  async getConfigs(ctx) {
    ctx.body = ctx.app.responser([
      { id: 'ehdev-configer-test', name: 'test', version: '1.0', },
      { id: 'ehdev-configer-test222', name: 'test222', version: '1.1', },
    ], true);
  }
  async getRemoteConfigs(ctx) {
    try {
      const result = await Commander.run('npm search --json ehdev-configs');
      ctx.body = ctx.app.responser(result, true);
    } catch(e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
  async add(ctx) {
    const { configName } = ctx.params;
    try {
      const result = await Commander.run(`npm i ${configName}  --save-exact --production --progress=false`, {
        cwd: ConfigerFolderPath,
      });
      ctx.body = ctx.app.responser('Install Successfully!', true);
    } catch(e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
  upload(ctx) {

  }
  remove(ctx) {

  }
  upgrade(ctx) {

  }
}

module.exports = ConfigerAPI;
