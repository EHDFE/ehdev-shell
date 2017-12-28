/**
 * Common API
 * @author ryan.bian
 * TODO: clean wallpaper diretory
 */
const path = require('path');
const { format, URLSearchParams } = require('url');
const { app } = require('electron');
const { CLIEngine } = require('eslint');

const { httpGet, saveImage, stat, generateQRCode, md5 } = require('../../utils/');

const BING_COVER_STORE_API = 'http://cn.bing.com/cnhp/coverstory/';
const LOCAL_WALLPAPER_DIR = app.getPath('temp');
const TRANSLATE_APP_ID = '20171124000099180';
const TRANSLATE_APP_SECRET = 'qVUM_LdhWvRhX2ufic0F';
const TRANSLATE_API_URL = 'http://api.fanyi.baidu.com/api/trans/vip/translate';

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

/**
 * request wallpaper info from bing
 * @param {*} ctx
 */
exports.getBingWallpaper = async (date = getDateString()) => {
  // const picUrl = `/api/common/wallpaper/${date}`;
  const dateString = date.split('-').join('');
  try {
    const coverstory = await httpGet(`${BING_COVER_STORE_API}?d=${dateString}`);
    const localImagePath = path.join(LOCAL_WALLPAPER_DIR, `wallpapers/wallpaper@${date}.jpg`);
    const result = Object.assign({
      url: format({
        protocol: 'file',
        slashes: true,
        pathname: localImagePath,
      }),
    }, coverstory);
    const dateDiff = (new Date().getTime() - new Date(date).getTime()) / 86400000;
    let fileStats;
    try {
      fileStats = await stat(localImagePath);
      if (!fileStats.isFile()) {
        await saveWallpaper(localImagePath, `/v1?d=${dateDiff}&w=1920`);
      }
    } catch (e) {
      await saveWallpaper(localImagePath, `/v1?d=${dateDiff}&w=1920`);
    }
    return result;
  } catch (e) {
    throw e;
  }
};
/**
 * handle daily image request
 * @param {*} ctx
 */
// exports.getLocalWallpaper = async date => {
//   // TODO: handle send
//   await send({}, `wallpapers/wallpaper@${date}.jpg`, {
//     root: LOCAL_WALLPAPER_DIR,
//     immutable: true,
//   });
// };
/**
 * translate
 */
exports.translate = async config => {
  const { query, from, to } = config;
  const salt = new Date().getTime();
  const queryObj = new URLSearchParams({
    q: query,
    from,
    to,
    appid: TRANSLATE_APP_ID,
    salt,
    sign: md5([TRANSLATE_APP_ID, query, salt, TRANSLATE_APP_SECRET].join('')),
  });
  try {
    const response = await httpGet(
      `${TRANSLATE_API_URL}?${queryObj.toString()}`
    );
    return response;
  } catch (e) {
    throw e;
  }
};
/**
 * generate qrcode
 * @param {*} ctx
 */
exports.getQRCode = async text => {
  const opts = {
    color: {
      dark: '#000000ff',
      light: '#ffffffff',
    },
  };
  try {
    const url = await generateQRCode(text, opts);
    return {
      url,
    };
  } catch (e) {
    throw e;
  }
};
/**
 * run eslint
 */
exports.runESlint = async cwd => {
  const cli = new CLIEngine({
    cwd,
  });
  const report = cli.executeOnFiles(['.']);
  const formatter = cli.getFormatter('json');
  const result = formatter(report.results);
  return JSON.parse(result);
};

// class CommonAPI {
//   /**
//    * request wallpaper info from bing
//    * @param {*} ctx
//    */
//   async getBingWallpaper(ctx) {
//     const date = ctx.params.date ? ctx.params.date : getDateString();
//     const picUrl = `/api/common/wallpaper/${date}`;
//     const dateString = date.split('-').join('');
//     try {
//       const coverstory = await httpGet(`${BING_COVER_STORE_API}?d=${dateString}`);
//       const result = Object.assign({
//         url: picUrl,
//       }, coverstory);
//       const dateDiff = (new Date().getTime() - new Date(date).getTime()) / 86400000;
//       const localImagePath = path.join(LOCAL_WALLPAPER_DIR, `wallpapers/wallpaper@${date}.jpg`);
//       let fileStats;
//       try {
//         fileStats = await stat(localImagePath);
//         if (!fileStats.isFile()) {
//           await saveWallpaper(localImagePath, `/v1?d=${dateDiff}&w=1920`);
//         }
//       } catch (e) {
//         await saveWallpaper(localImagePath, `/v1?d=${dateDiff}&w=1920`);
//       }
//       ctx.body = ctx.app.responser(result, true);
//     } catch (e) {
//       ctx.body = ctx.app.responser(e.toString(), false);
//     }
//   }
//   /**
//    * handle daily image request
//    * @param {*} ctx
//    */
//   async getLocalWallpaper(ctx) {
//     const { date } = ctx.params;
//     await send(ctx, `wallpapers/wallpaper@${date}.jpg`, {
//       root: LOCAL_WALLPAPER_DIR,
//       immutable: true,
//     });
//   }
//   /**
//    * translate
//    */
//   async translate(ctx) {
//     const { query, from, to } = ctx.params;
//     const salt = new Date().getTime();
//     const queryObj = new URLSearchParams({
//       q: query,
//       from,
//       to,
//       appid: TRANSLATE_APP_ID,
//       salt,
//       sign: md5([TRANSLATE_APP_ID, query, salt, TRANSLATE_APP_SECRET].join('')),
//     });
//     try {
//       const response = await httpGet(
//         `${TRANSLATE_API_URL}?${queryObj.toString()}`
//       );
//       ctx.body = ctx.app.responser(response, true);
//     } catch (e) {
//       ctx.body = ctx.app.responser(e.toString(), false);
//     }
//   }
//   /**
//    * generate qrcode
//    * @param {*} ctx
//    */
//   async getQRCode(ctx) {
//     const { text } = ctx.params;
//     const opts = {
//       color: {
//         dark: '#000000ff',
//         light: '#ffffffff',
//       },
//     };
//     try {
//       const url = await generateQRCode(text, opts);
//       ctx.body = ctx.app.responser({
//         url,
//       }, true);
//     } catch (e) {
//       ctx.body = ctx.app.responser(e.toString(), false);
//     }
//   }
//   /**
//    * run eslint
//    */
//   async runESlint(ctx, next) {
//     await next();
//     const { cwd } = ctx.params;
//     const cli = new CLIEngine({
//       cwd,
//     });
//     const report = cli.executeOnFiles(['.']);
//     const formatter = cli.getFormatter('json');
//     const result = formatter(report.results);
//     ctx.body = ctx.app.responser(
//       JSON.parse(result),
//       true,
//     );
//   }
// }

// module.exports = CommonAPI;
