/**
 * Service Model
 * @author ryan.bian
 */
const builderRunner = require('../../service/builder');
const serverRunner = require('../../service/server');
const { serviceStore } = require('../../service/index');

class ServiceAPI {
  startServer(ctx) {
    const { root } = ctx.body;
    const { pid } = serverRunner(root, ctx.app.webContent);
    ctx.body = ctx.app.responser({
      pid,
      serviceName: 'Server',
    }, true);
  }
  stopServer(ctx) {
    const { pid } = ctx.params;
    let res;
    if (!serviceStore.has(pid)) {
      res = ctx.app.responser(`process:${pid} is not running.`, false);
    } else {
      serviceStore.delete(pid);
      res = ctx.app.responser(null, true);
    }
    ctx.body = res;
  }
  startBuilder(ctx) {
  }
  stopBuilder(ctx) {
  }
}

module.exports = ServiceAPI;
