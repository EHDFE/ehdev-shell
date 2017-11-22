/**
 * Common API
 * @author ryan.bian
 * TODO: clean wallpaper diretory
 */
const path = require('path');
const fs = require('fs');
const send = require('koa-send');
const { app } = require('electron');
const { get, saveImage, stat } = require('../../utils/');

const BING_COVER_STORE_API = 'http://cn.bing.com/cnhp/coverstory/';
const LOCAL_WALLPAPER_DIR = app.getPath('temp');

const getDateString = () => {
  const date = new Date();
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  ].join('-');
};

const saveWallpaper = async (filePath, urlPath) => {
  return await saveImage(
    filePath,
    {
      hostname: 'bing.ioliu.cn',
      path: urlPath,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
      }
    },
  );
};

class CommonAPI {
  async getBingWallpaper(ctx) {
    const date = ctx.params.date ? ctx.params.date : getDateString();
    const picUrl = `/api/common/wallpaper/${date}`;
    const dateString = date.split('-').join('');
    try {
      const coverstory = await get(`${BING_COVER_STORE_API}?d=${dateString}`);
      const result = Object.assign({
        url: picUrl,
      }, coverstory);
      const dateDiff = (new Date().getTime() - new Date(date).getTime()) / 86400000;
      const localImagePath = path.join(LOCAL_WALLPAPER_DIR, `wallpapers/wallpaper@${date}.jpg`);
      let fileStats;
      try {
        fileStats = await stat(localImagePath);
        if (!fileStats.isFile()) {
          await saveWallpaper(localImagePath, `/v1?d=${dateDiff}&w=1920`);
        }
      } catch (e) {
        await saveWallpaper(localImagePath, `/v1?d=${dateDiff}&w=1920`);
      }
      ctx.body = ctx.app.responser(result, true);
    } catch (e) {
      ctx.body = ctx.app.responser(e.toString(), false);
    }
  }
  async getLocalWallpaper(ctx) {
    const { date } = ctx.params;
    await send(ctx, `wallpapers/wallpaper@${date}.jpg`, {
      root: LOCAL_WALLPAPER_DIR,
      immutable: true,
    });
  }
}

module.exports = CommonAPI;
