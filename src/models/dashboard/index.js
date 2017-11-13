/**
 * Dashboard Model
 * @author ryan.bian
 */

class DashboardAPI {
  async getProjectList(ctx) {
    await new Promise(resolve => {
      ctx.app.db.project.find({}, (err, docs) => {
        if (err) {
          ctx.body = ctx.app.responser(err.toString(), false);
        } else {
          ctx.body = ctx.app.responser({
            docs
          }, true);
        }
        resolve();
      });
    });
  }
}

module.exports = DashboardAPI;
