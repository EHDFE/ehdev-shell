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

// Service Model
const ServiceAPI = require('./models/service/');

// Configer Model
const ConfigerAPI = require('./models/configer/');

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
  .post('/root/:rootPath', projectEnv.setRoot)
  .put('/config/:rootPath', koaBody(), projectEnv.setConfig);

// project npm router
const npmRouter = Router();

npmRouter
  .post('/install/', koaBody(), projectNpm.install)
  .post('/install/:packageName', koaBody(), projectNpm.install)
  .post('/uninstall/:packageName', koaBody(), projectNpm.uninstall)
  .post('/ls/', koaBody(), projectNpm.ls)
  .post('/ls/:packageName', koaBody(), projectNpm.ls)
  .post('/outdated/', koaBody(), projectNpm.outdated)
  .post('/outdated/:packageName', koaBody(), projectNpm.outdated)
  .post('/allVersions/', koaBody(), projectNpm.allVersions);

// service router
const serviceRouter = Router();
const service = new ServiceAPI();

serviceRouter
  .post('/server', koaBody(), service.startServer)
  .delete('/server/:pid', service.stop)
  .post('/builder', koaBody(), service.startBuilder)
  .delete('/builder/:pid', service.stop);

// configer router
const configerRouter = Router();
const configer = new ConfigerAPI();

configerRouter
  .get('/configs', configer.getConfigs)
  .get('/remoteConfigs', configer.getRemoteConfigs)
  .post('/config', koaBody(), configer.add)
  .post('/upload', configer.upload)
  .put('/config', koaBody(),  configer.upgrade)
  .delete('/config/:configName', configer.remove);

// combine all subrouters
apiRouter.use('/upload', uploadRouter.routes(), uploadRouter.allowedMethods());
apiRouter.use('/project', projectRouter.routes(), projectRouter.allowedMethods());
apiRouter.use('/npm', npmRouter.routes(), projectRouter.allowedMethods());
apiRouter.use('/service', serviceRouter.routes(), serviceRouter.allowedMethods());
apiRouter.use('/configer', configerRouter.routes(), configerRouter.allowedMethods());

module.exports = apiRouter;
