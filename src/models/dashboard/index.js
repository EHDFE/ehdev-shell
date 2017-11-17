/**
 * Dashboard Model
 * @author ryan.bian
 */

const { get  } = require('../../utils/');
const moment = require('moment');

class DashboardAPI {
  async getProjectList(ctx) {
    await new Promise(resolve => {
      ctx.app.db.project.find({}, (err, docs) => {
        if (err) {
          ctx.body = ctx.app.responser(err.toString(), false);
        } else {
          ctx.body = ctx.app.responser(
            {
              docs,
            },
            true
          );
        }
        resolve();
      });
    });
  }
  async getOverall(ctx) {
    const { db } = ctx.app;
    const getAssetsCount = new Promise((resolve, reject) => {
      db.upload.count({}, (err, count) => {
        if (err) {
          reject(err);
        } else {
          resolve(count);
        }
      });
    });
    const getProjectsCount = new Promise((resolve, reject) => {
      db.project.count({}, (err, count) => {
        if (err) {
          reject(err);
        } else {
          resolve(count);
        }
      });
    });
    try {
      const assetsCount = await getAssetsCount;
      const projectsCount = await getProjectsCount;
      ctx.body = ctx.app.responser(
        {
          assetsCount,
          projectsCount,
        },
        true
      );
    } catch (e) {
      // ignore
      ctx.body = ctx.app.responser(
        {
          assetsCount: 0,
          projectsCount: 0,
        },
        true
      );
    }
  }
  async getDailyWallpaper(ctx) {
    try {
      // const [img, coverstory] = await Promise.all([
      //   get('http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1'),
      //   get('http://cn.bing.com/cnhp/coverstory/')
      // ]);

      let d = ctx.params.day ? moment().add(-ctx.params.day, 'day').format('YYYYMMDD') : moment().format('YYYYMMDD');
      const coverstory = await get(`http://cn.bing.com/cnhp/coverstory/?d=${d}`);
      const result = Object.assign({}, coverstory, { url: `http://bing.ioliu.cn/v1?${ctx.params.day ? 'd=' + ctx.params.day + '&' : ''}w=1920&1200`});
      ctx.body = ctx.app.responser(result, true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
}

module.exports = DashboardAPI;
