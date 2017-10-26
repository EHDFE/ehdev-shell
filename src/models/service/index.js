/**
 * Service Model
 * @author ryan.bian
 */
const path = require('path');
const { serviceStore } = require('../../service/index');
const Commander = require('../../service/commander');
const { ConfigerFolderPath, WebpackPath, WebpackDevServerPath } = require('../../utils/env');

const builderScriptPath = require.resolve('../../service/builder');
const serverScriptPath = require.resolve('../../service/server');

class ServiceAPI {
  startServer(ctx) {
    const { root, port, configerName } = ctx.request.body;
    const _port = port || 3000;
    const { pid } = Commander.run(`node ${serverScriptPath} --ConfigerPath="${ConfigerFolderPath}" --ConfigerName=${configerName} --port=${_port}`, {
      cwd: root,
      webContent: ctx.app.webContent,
      parseResult: false,
      env: {
        WEBPACK_PATH: WebpackPath,
        WEBPACK_DEV_SERVER_PATH: WebpackDevServerPath,
      },
    });
    ctx.body = ctx.app.responser({
      pid,
    }, true);
  }
  stopServer(ctx) {
    const { pid } = ctx.params;
    const _pid = Number(pid);
    let res;
    if (!serviceStore.has(_pid)) {
      res = ctx.app.responser(`process:${_pid} is not running.`, true);
    } else {
      serviceStore.delete(_pid);
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
