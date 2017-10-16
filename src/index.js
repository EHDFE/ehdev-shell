/**
 * backend starter
 * @author ryan.bian
 */
const path = require('path');
const { app } = require('electron');
const Koa = require('koa');
const Router = require('koa-router');
const views = require('koa-views');
const send = require('koa-send');
const Boom = require('boom');
const isDev = require('electron-is-dev');
const DataStore = require('nedb');

const apiRouter = require('./apiConfiger');
const responser = require('./utils/responser');

module.exports = PORT => {

  const APP = new Koa();
  const USERDATA_PATH = app.getPath('userData');
  const DB_LIST = [
    'upload',
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

  APP.use(views(__dirname + '/views', {
    map: {
      html: 'nunjucks',
    },
  }));

  if (isDev) {
    const { devMiddleware, hotMiddleware } = require('koa-webpack-middleware');
    const webpack = require('webpack');
    const webpackConfig = require('../config/webpack.config');
    const compile = webpack(webpackConfig({
      dev: true
    }));

    APP.use(devMiddleware(compile, {
      publicPath: '/assets/',
    }));
    APP.use(hotMiddleware(compile, {
      reload: true,
    }));
  }

  APP.use(router.routes());
  APP.use(router.allowedMethods({
    throw: true,
    notImplemented: () => new Boom.notImplemented(),
    methodNotAllowed: () => new Boom.methodNotAllowed(),
  }));

  APP.listen(PORT);

};

