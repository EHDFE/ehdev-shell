/**
 * Configer Model
 * @author ryan.bian
 */
const path = require('path');
const Commander = require('../../service/commander');
const { hasDir, hasFile, mkdir, readJSON } = require('../../utils/');
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
    const pkg = await readJSON(ConfigerFolderPackagePath);
    const deps = Object.keys(pkg.dependencies).map(pkgName => ({
      id: pkgName,
      name: pkgName,
      version: pkg.dependencies[pkgName],
    }));
    ctx.body = ctx.app.responser(deps, true);
  }
  async getRemoteConfigs(ctx) {
    try {
      const result = await Commander.run('npm search --json ehdev-configer-', {
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
    const { configerName } = ctx.request.body;
    try {
      const res = await Commander.run(`npm i ${configerName} --save-exact --production`, {
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
