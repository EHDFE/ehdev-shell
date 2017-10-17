/**
 * config api router
 * @author ryan.bian
 */
const Router = require('koa-router');
const koaBody = require('koa-body');

// Upload Models
const UploadListAPI = require('./models/upload/list');
const UploadFileAPI = require('./models/upload/file');

// Project Models
const ProjectEnvAPI = require('./models/project/env');
const ProjectNpmAPI = require('./models/project/npm');

const apiRouter = Router();

const uploadList = new UploadListAPI();
const uploadFile = new UploadFileAPI();

const uploadRouter = Router();
/**
 * get => /upload/list/
 * post => /upload/list/
 * delete => /upload/list/:ids
 */
uploadRouter
  .get('/list/', uploadList.get)
  .post('/list/', koaBody(), uploadList.post)
  // .put('/list', uploadList.put)
  .del('/list/:ids', uploadList.del);

/**
 * post => /upload/file/
 */
uploadRouter.post('/file/', uploadFile.post);

const projectEnv = new ProjectEnvAPI();
const projectNpm = new ProjectNpmAPI();

// project env router
const projectRouter = Router();
/**
 * put => /project/root/
 */
projectRouter
  .put('/root/:rootPath', projectEnv.setRoot);

// project npm router
const npmRouter = Router();

npmRouter
  .post('/install/', koaBody(), projectNpm.install)
  .post('/install/:packageName', koaBody(), projectNpm.install)
  .post('/ls/', koaBody(), projectNpm.ls)
  .post('/ls/:packageName', koaBody(), projectNpm.ls)
  .post('/outdated/', koaBody(), projectNpm.outdated)
  .post('/outdated/:packageName', koaBody(), projectNpm.outdated);

// combine all subrouters
apiRouter.use('/upload', uploadRouter.routes(), uploadRouter.allowedMethods());
apiRouter.use('/project', projectRouter.routes(), projectRouter.allowedMethods());
apiRouter.use('/npm', npmRouter.routes(), projectRouter.allowedMethods());


module.exports = apiRouter;
