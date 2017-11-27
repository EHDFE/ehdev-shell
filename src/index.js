/**
 * backend starter
 * @author ryan.bian
 */
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const Koa = require('koa');
const Router = require('koa-router');
const views = require('koa-views');
const send = require('koa-send');
const Boom = require('boom');
const isDev = require('electron-is-dev');
const DataStore = require('nedb');
const morgan = require('koa-morgan');
const Raven = require('raven');

const apiRouter = require('./apiRegister');
const { responser } = require('./utils/');

module.exports = (PORT = 3000, webContent) => {

  const APP = new Koa();
  Raven.config(
    process.env.NODE_ENV === 'production' &&
    'https://d2e7d99b1c414fe0ab0b02b67f17c1c8:d24b5c31a1a24020a73333fef1c306ab@sentry.io/247420'
  ).install();
  const APPDATA_PATH = app.getPath('appData');
  const USERDATA_PATH = app.getPath('userData');
  const DB_LIST = [
    'upload',
    'project',
  ];
  APP.db = {};
  DB_LIST.forEach(name => {
    APP.db[name] = new DataStore({
      filename: path.join(USERDATA_PATH, `${name}.db`),
      autoload: true,
    });
  });

  // Usage:
  // ctx.app.responser(content, successful)
  APP.responser = responser;
  APP.webContent = webContent;

  // ROUTER CONFIG
  const router = Router();
  const assetsRouter = Router();

  assetsRouter.use(async (ctx) => {
    await send(ctx, ctx.path, {
      root: path.resolve(__dirname, '..'),
    });
  });

  router.use('/api', apiRouter.routes(), apiRouter.allowedMethods());
  router.use('/assets', assetsRouter.routes(), assetsRouter.allowedMethods());

  // RENDER PAGES
  router.get(/^\/.*(?:\/|$)/, async ctx => {
    await ctx.render('index.html', {
      production: !isDev,
    });
  });

  const logStream = fs.createWriteStream(path.join(APPDATA_PATH + 'ehd-shell.log'),
    { flags: 'a' });
  const devLogger = morgan('combined');

  if (isDev) {
    APP.use(devLogger);
  }
  APP.use(morgan('combined', { stream: logStream }));

  APP.use(views(__dirname + '/views', {
    map: {
      html: 'nunjucks',
    },
  }));

  if (isDev) {
    const { devMiddleware, hotMiddleware } = require('koa-webpack-middleware');
    const webpack = require('webpack');
    const webpackConfig = require('../config/webpack.config')({
      dev: true,
    });
    const compile = webpack(webpackConfig);

    APP.use(devMiddleware(compile, {
      publicPath: webpackConfig.output.publicPath,
      stats: {
        colors: true,
      },
    }));
    APP.use(hotMiddleware(compile, {
      reload: true,
      path: '/__webpack_hmr',
      heartbeat: 1000,
    }));
  }

  APP.use(router.routes());
  APP.use(router.allowedMethods({
    throw: true,
    notImplemented: () => new Boom.notImplemented(),
    methodNotAllowed: () => new Boom.methodNotAllowed(),
  }));

  APP.on('error', function (err) {
    Raven.captureException(err, function (err, eventId) {
    });
  });

  APP.listen(PORT);
};

