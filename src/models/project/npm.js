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
    const { rootPath, args } = ctx.request.body;
    const { pid } = Commander.run(`npm i ${packageName} ${args || ''}`, {
      cwd: rootPath,
      parseResult: false,
      webContent: ctx.app.webContent,
    });
    ctx.body = ctx.app.responser({
      pid,
    }, true);
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
}

module.exports = ProjectNpmAPI;
