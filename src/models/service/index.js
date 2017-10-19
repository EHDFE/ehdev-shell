/**
 * Service Model
 * @author ryan.bian
 */
const Builder = require('../../service/builder');
const Server = require('../../service/server');
const { ServiceStore } = require('../../service/base');

const serviceStore = new ServiceStore();

class ServiceAPI {
  startServer(ctx) {
    const { root } = ctx.body;
    const server = new Server(root, '', {}, ctx.app.webContent, serviceStore);
    const { pid } = server.start();
    serviceStore.set(pid, server);
    ctx.body = ctx.app.responser({
      pid,
    }, true);
  }
  stopServer(ctx) {
    const { pid } = ctx.params;
    let res;
    if (!serviceStore.has(pid)) {
      res = ctx.app.responser(`process:${pid} is not running.`, false);
    } else {
      serviceStore.get(pid).kill();
      serviceStore.delete(pid);
      res = ctx.app.responser(null, true);
    }
    ctx.body = res;
  }
  startBuilder(ctx) {
    const builder = new Builder();
    ctx.body = ctx.app.responser({
      success: true
    }, true);
  }
  stopBuilder(ctx) {

  }
}

module.exports = ServiceAPI;
