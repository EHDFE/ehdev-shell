/**
 * Project Environment Model
 * @author ryan.bian
 */
const path = require('path');
const { readJSON } = require('../../utils/');

class ProjectEnvAPI {
  async setRoot(ctx) {
    const { rootPath } = ctx.params;
    try {
      const pkg = await readJSON(
        path.join(rootPath, 'package.json')
      );
      const projectConfig = await readJSON(
        path.join(rootPath, 'abc.json')
      );
      ctx.body = ctx.app.responser({
        package: pkg,
        config: projectConfig,
      }, true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
}

module.exports = ProjectEnvAPI;
