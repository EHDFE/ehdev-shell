/**
 * This model is for executing npm commands
 * @author ryan.bian
 */
const npm = require('npm');

/**
 * npm install
 * @param {string} packageName
 * @param {object} args
 */
const npmInstall = (packageName, args) =>
  new Promise(async (resolve, reject) => {
    npm.load(args, e => {
      if (e) {
        reject(e);
      } else {
        npm.commands.install(packageName ? [packageName] : [], (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      }
    });
  });

/**
 * List installed packages
 * @param {string} packageName
 * @param {object} args
 */
const npmLs = (packageName, args) =>
  new Promise(async (resolve, reject) => {
    npm.load(args, e => {
      if (e) {
        reject(e);
      } else {
        npm.commands.ls(packageName ? [packageName] : [], (err, data, lite) => {
          resolve(lite);
        });
      }
    });
  });

/**
 * check for outdated packages
 * @param {string} packageName
 * @param {object} args
 */
const npmOutdated = (packageName, args) =>
  new Promise(async (resolve, reject) => {
    npm.load(args, e => {
      if (e) {
        reject(e);
      } else {
        npm.commands.outdated(packageName ? [packageName] : [], (err, data) => {
          if (err) {
            reject(err);
          } else {
            const res = {};
            data.forEach(d => {
              res[d[1]] = {
                current: d[2],
                wanted: d[3],
                latest: d[4],
              };
            });
            resolve(res);
          }
        });
      }
    });
  });

class ProjectNpmAPI {
  /**
   * install dependence
   */
  async install(ctx) {
    const { packageName } = ctx.params;
    const config = ctx.request.body;
    try {
      const result = await npmInstall(packageName, config);
      ctx.body = ctx.app.responser(result, true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
  async ls(ctx) {
    const { packageName } = ctx.params;
    const config = ctx.request.body;
    try {
      const result = await npmLs(packageName, config);
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
    const { packageName } = ctx.params;
    const config = ctx.request.body;
    try {
      const result = await npmOutdated(packageName, config);
      ctx.body = ctx.app.responser(result, true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
}

module.exports = ProjectNpmAPI;

