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
const dllBuilderScriptPath = require.resolve('../../child_service/dllBuilder');

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
        CONFIGER_FOLDER_PATH: ConfigerFolderPath,
        NODE_ENV: 'development',
      },
    });
    ctx.app.db.project.update(
      {
        projectPath: root,
      },
      {
        $inc: {
          serverStartCount: 1,
        },
      },
      { upsert: true }
    );
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
    const { root, configerName, isDll } = ctx.request.body;
    let command;
    if (isDll) {
      command = `node ${dllBuilderScriptPath} --ConfigerPath="${ConfigerFolderPath}" --ConfigerName=${configerName}`;
    } else {
      command = `node ${builderScriptPath} --ConfigerPath="${ConfigerFolderPath}" --ConfigerName=${configerName}`;
    }
    const { pid } = Commander.run(command, {
      cwd: root,
      webContent: ctx.app.webContent,
      parseResult: false,
      env: {
        SHELL_NODE_MODULES_PATH,
        CONFIGER_FOLDER_PATH: ConfigerFolderPath,
        NODE_ENV: 'production',
      },
    });
    ctx.app.db.project.update(
      {
        projectPath: root,
      },
      {
        $inc: {
          serverBuildCount: 1,
        },
      },
      { upsert: true }
    );
    ctx.body = ctx.app.responser({
      pid,
    }, true);
  }
}

module.exports = ServiceAPI;
