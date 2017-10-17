/**
 * Upload File Model
 * @author ryan.bian
 */
const proxy = require('koa-better-http-proxy');

// TODO: make UPLOAD_SERVICE_CONFIG configerable
const UPLOAD_SERVICE_CONFIG = {
  host: 'image.tf56.com',
  path: '/fastdfsWeb/upload',
  method: 'POST',
  limit: '1000mb',
};

class FileAPI {
  post(ctx, next) {
    return proxy(UPLOAD_SERVICE_CONFIG.host, {
      proxyReqOptDecorator(proxyReqOpts) {
        proxyReqOpts.method = UPLOAD_SERVICE_CONFIG.method;
        return proxyReqOpts;
      },
      proxyReqPathResolver: () => UPLOAD_SERVICE_CONFIG.path,
      userResDecorator(proxyRes, proxyResData, ctx) {
        return new Promise((resolve) => {
          try {
            const result = JSON.parse(proxyResData.toString());
            resolve(ctx.app.responser(result.data, result.success));
          } catch (e) {
            resolve(ctx.app.responser(e, false));
          }
        });
      },
      limit: UPLOAD_SERVICE_CONFIG.limit,
    })(ctx, next);
  }
}

module.exports = FileAPI;
