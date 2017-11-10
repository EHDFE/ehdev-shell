/**
 * This model is for executing npm commands
 * @author ryan.bian
 * TODO:
 * 1. support the global configeration: registry
 */
const Commander = require('../../service/commander');

class ProjectNpmAPI {
  /**
   * install dependence
   */
  async install(ctx) {
    const packageName = ctx.params.packageName || '';
    const { rootPath, args, version, packages } = ctx.request.body;
    let packageList = '';
    if (packageName) {
      packageList = `${packageName}@${version?version:'latest'}`;
    } else if (packages) {
      if (packages instanceof Array) {
        packages.forEach((d) => {
          packageList += ` ${d.packageName}@${d.version?d.version:'latest'}`;
        });
      } else {
        packageList = '';
      }
    } else {
      packageList = '';
    }
    const data =await Commander.run(`npm i ${packageList} ${args || ''}`, {
      cwd: rootPath,
      parseResult: 'string',
      webContent: ctx.app.webContent,
    });
    ctx.body = ctx.app.responser(data, true);
  }
  async uninstall(ctx) {
    const packageName = ctx.params.packageName || '';
    const { rootPath, args } = ctx.request.body;
    const data = await Commander.run(`npm uninstall ${packageName} ${args || ''}`, {
      cwd: rootPath,
      parseResult: 'string',
      webContent: ctx.app.webContent,
    });
    ctx.body = ctx.app.responser(data, true);
  }
  async ls(ctx) {
    const packageName = ctx.params.packageName || '';
    const { rootPath, args } = ctx.request.body;
    try {
      const result = await Commander.run(`npm ls ${packageName} --json --depth=0 ${args || ''}`, {
        cwd: rootPath,
        webContent: ctx.app.webContent,
      });
      ctx.body = ctx.app.responser(result, true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
  /**
   * reduce duplication
   * TODO:
   */
  async dedupe(ctx) {

  }
  /**
   * Check for outdated packages
   */
  async outdated(ctx) {
    const packageName = ctx.params.packageName || '';
    const { rootPath, args } = ctx.request.body;
    try {
      const result = await Commander.run(`npm outdated ${packageName} --json ${args || ''}`, {
        cwd: rootPath,
        webContent: ctx.app.webContent,
      });
      ctx.body = ctx.app.responser(result, true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
  /**
   * All packages versions
   */
  async allVersions(ctx) {
    const packageName = ctx.params.packageName || '';
    const {   rootPath, args } = ctx.request.body;
    try {

      let [outdatedList, list] = await Promise.all([
        Commander.run(`npm outdated ${packageName} --json ${args || ''}`, {cwd: rootPath, webContent: ctx.app.webContent}),
        Commander.run(`npm ls ${packageName} --json --depth=0 ${args || ''}`, {cwd: rootPath, webContent: ctx.app.webContent})
      ]);
      let result = {versions: {}};
      for (let prop in list.dependencies) {
        if (prop in outdatedList) {
          result.versions[prop] = {
            current: outdatedList[prop].current,
            wanted: outdatedList[prop].wanted,
            latest: outdatedList[prop].latest,
            outdated: true
          };
        } else if (list.dependencies[prop]['version']) {
          result.versions[prop] = {
            current: list.dependencies[prop]['version'],
            wanted: list.dependencies[prop]['version'],
            latest: list.dependencies[prop]['version'],
            outdated: false
          };
        } else if (list.dependencies[prop]['peerMissing']) {
          result.versions[prop] = {
            current: list.dependencies[prop]['required']['version'],
            wanted: list.dependencies[prop]['required']['version'],
            latest: list.dependencies[prop]['required']['version'],
            outdated: false,
            peerMissing: list.dependencies[prop]['required']['peerMissing']
          };
        }
      }

      ctx.body = ctx.app.responser(Object.assign(result, list), true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
}

module.exports = ProjectNpmAPI;
