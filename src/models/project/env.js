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
  /**
   * record the project for statistics usage
   */
  async makeRecord(ctx) {
    const { rootPath } = ctx.params;
    // insert project to db
    await new Promise(resolve => {
      ctx.app.db.project.update(
        {
          projectPath: rootPath,
        },
        {
          $inc: {
            count: 1,
          },
        },
        { upsert: true },
        (err, newDoc) => {
          if (err) {
            ctx.body = ctx.app.responser(err.toString(), false);
          } else {
            ctx.body = ctx.app.responser({
              newDoc,
            }, true);
          }
          resolve();
        });
    });
  }

  async setConfig(ctx) {
    const { rootPath } = ctx.params;
    const config = ctx.request.body;
    try {
      let configStr = JSON.stringify(config, null, '\t');
      await writeJSON(path.join(rootPath, 'abc.json'), configStr);
      ctx.body = ctx.app.responser('修改成功', true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
}

module.exports = ProjectEnvAPI;
