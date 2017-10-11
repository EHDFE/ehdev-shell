/**
 * config api router
 * @author ryan.bian
 */
const Router = require('koa-router');
const koaBody = require('koa-body');

const UploadListAPI = require('./models/upload/list');
const UploadFileAPI = require('./models/upload/file');

const apiRouter = Router();

const uploadList = new UploadListAPI();
const uploadFile = new UploadFileAPI();


// upload router
// request /upload/**
const uploadRouter = Router();

uploadRouter
  .get('/list', uploadList.get)
  // .post('/list', uploadList.post)
  .put('/list', koaBody(), uploadList.put)
  .del('/list', uploadList.del);

uploadRouter.put('/file', uploadFile.put);


// combine all subrouters
apiRouter.use('/upload', uploadRouter.routes(), uploadRouter.allowedMethods());

module.exports = apiRouter;
