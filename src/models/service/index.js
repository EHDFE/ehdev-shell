/**
 * Service Model
 * @author ryan.bian
 */
const path = require('path');
const { serviceStore } = require('../../service/index');
const Commander = require('../../service/commander');
const {
  ConfigerFolderPath,
  SHELL_NODE_MODULES_PATH,
} = require('../../utils/env');

const serverScriptPath = require.resolve('../../child_service/server');
const builderScriptPath = require.resolve('../../child_service/builder');

class ServiceAPI {
  startServer(ctx) {
    const { root, port, configerName } = ctx.request.body;
    const _port = port || 3000;
    const { pid } = Commander.run(`node ${serverScriptPath} --ConfigerPath="${ConfigerFolderPath}" --ConfigerName=${configerName} --port=${_port}`, {
      cwd: root,
      webContent: ctx.app.webContent,
      parseResult: false,
      env: {
        SHELL_NODE_MODULES_PATH,
      },
    });
    ctx.body = ctx.app.responser({
      pid,
    }, true);
  }
  stop(ctx) {
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
    const { root, configerName } = ctx.request.body;
    const { pid } = Commander.run(`node ${builderScriptPath} --ConfigerPath="${ConfigerFolderPath}" --ConfigerName=${configerName}`, {
      cwd: root,
      webContent: ctx.app.webContent,
      parseResult: false,
      env: {
        SHELL_NODE_MODULES_PATH,
      },
    });
    ctx.body = ctx.app.responser({
      pid,
    }, true);
  }
}

module.exports = ServiceAPI;
