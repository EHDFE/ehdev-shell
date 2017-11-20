/**
 * Dashboard Model
 * @author ryan.bian
 */

const { get, saveWallpaper } = require('../../utils/');
const moment = require('moment');
const { app } = require('electron');
const fs = require('fs');
const path = require('path');

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
      let imgUrl = `/api/dashboard/wallpaper?d=${ctx.params.day}`;
      const coverstory = await get(`http://cn.bing.com/cnhp/coverstory/?d=${ctx.params.day ? ctx.params.day : moment().format('YYYYMMDD')}`);
      let d = ctx.params.day ? (Math.floor(( moment().valueOf() - moment(ctx.params.day, 'YYYYMMDD').valueOf()) / 86400000)) : 0;
      let result = Object.assign({}, coverstory, { url: imgUrl});
      await saveWallpaper(d);
      ctx.body = ctx.app.responser(result, true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
  async wallpaper(ctx) {
    try {
      ctx.res.setHeader('Content-Type', 'image/jpg');
      fs.createReadStream(path.resolve(app.getPath('userData'), './wallpaper.jpg')).pipe(ctx.res);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
}

module.exports = DashboardAPI;
