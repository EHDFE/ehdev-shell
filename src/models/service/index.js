/**
 * Service Model
 * @author ryan.bian
 */
const path = require('path');
const { serviceStore } = require('../../service/index');
const Commander = require('../../service/commander');
const { ConfigerFolderPath } = require('../../utils/env');

const builderScriptPath = require.resolve('../../service/builder');
const serverScriptPath = require.resolve('../../service/server');

class ServiceAPI {
  startServer(ctx) {
    const { root } = ctx.request.body;
    Commander.run(`node ${serverScriptPath} --ConfigerPath="${ConfigerFolderPath}" --ConfigerName=ehdev-configer-spa --port=3000`, {
      cwd: root,
      webContent: ctx.app.webContent,
    });
    // const { pid } = serverRunner(root, ctx.app.webContent);
    // ctx.body = ctx.app.responser({
    //   pid,
    //   serviceName: 'Server',
    // }, true);
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
