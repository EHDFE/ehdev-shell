/**
 * Configer Model
 * @author ryan.bian
 */
const path = require('path');
const Commander = require('../../service/commander');
const { hasDir, hasFile, mkdir } = require('../../utils/');
const { ConfigerFolderPath, ConfigerFolderPackagePath } = require('../../utils/env');

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
      const result = await Commander.run('npm search --json ehdev-configs', {
        cwd: ConfigerFolderPath,
        webContent: ctx.app.webContent,
        useCnpm: false,
      });
      ctx.body = ctx.app.responser(result, true);
    } catch(e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
  async add(ctx) {
    const { configName } = ctx.params;
    try {
      const res = await Commander.run(`npm i ${configName} --save-exact --production --progress=false`, {
        cwd: ConfigerFolderPath,
        webContent: ctx.app.webContent,
        parseResult: true,
      });
      ctx.body = ctx.app.responser(res, true);
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
