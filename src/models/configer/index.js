/**
 * Configer Model
 * @author ryan.bian
 */
const path = require('path');
const Commander = require('../../service/commander');
const { hasDir, hasFile, mkdir, readJSON, readFile } = require('../../utils/');
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
    const deps = [];
    const configs = pkg.dependencies && Object.keys(pkg.dependencies) || [];
    for (const pkgName of configs) {
      if (pkgName.startsWith('ehdev-configer-')) {
        try {
          const configPkg = await readJSON(path.join(ConfigerFolderPath, `node_modules/${pkgName}/package.json`));
          const readme = await readFile(path.join(ConfigerFolderPath, `node_modules/${pkgName}/README.md`), 'utf-8');
          const history = await readFile(path.join(ConfigerFolderPath, `node_modules/${pkgName}/HISTORY.md`), 'utf-8');
          deps.push({
            id: pkgName,
            name: pkgName,
            version: configPkg.version,
            description: configPkg.description,
            readme,
            history,
          });
        } catch (e) {
          // nothing
        }
      }
    }
    ctx.body = ctx.app.responser(deps, true);
  }
  async getRemoteConfigs(ctx) {
    try {
      const result = await Commander.run('npm search --json ehdev-configer-', {
        cwd: ConfigerFolderPath,
        // webContent: ctx.app.webContent,
        useCnpm: false,
      });
      ctx.body = ctx.app.responser(result, true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
  async add(ctx) {
    const { configerName } = ctx.request.body;
    try {
      const { pid } = await Commander.run(`npm i ${configerName} --save-exact --production`, {
        cwd: ConfigerFolderPath,
        webContent: ctx.app.webContent,
        parseResult: false,
      });
      ctx.body = ctx.app.responser({
        installPid: pid,
      }, true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
  upload(ctx) {

  }
  async remove(ctx) {
    const { configName } = ctx.params;
    try {
      const { pid } = await Commander.run(`npm uninstall ${configName} -S --production`, {
        cwd: ConfigerFolderPath,
        webContent: ctx.app.webContent,
        parseResult: false,
      });
      ctx.body = ctx.app.responser({
        removePid: pid,
      }, true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
  async upgrade(ctx) {
    const { configerName, version } = ctx.request.body;
    try {
      const { pid } = await Commander.run(`npm i ${configerName}@${version} --save-exact --production`, {
        cwd: ConfigerFolderPath,
        webContent: ctx.app.webContent,
        parseResult: false,
      });
      ctx.body = ctx.app.responser({
        upgradePid: pid,
      }, true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
}

module.exports = ConfigerAPI;
