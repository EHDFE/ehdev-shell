/**
 * Project Environment Model
 * @author ryan.bian
 */
const path = require('path');
const { readJSON, writeJSON } = require('../../utils/');

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
        pkg,
        config: projectConfig,
      }, true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }

  async setConfig(ctx) {
    const { rootPath } = ctx.params;
    const { config } = ctx.request.body;
    try {
      let configObj = JSON.parse(config);
      let configStr = JSON.stringify(configObj, null, '\t');
      await writeJSON(path.join(rootPath, 'abc.json'), configStr);
      ctx.body = ctx.app.responser('修改成功', true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
}

module.exports = ProjectEnvAPI;
