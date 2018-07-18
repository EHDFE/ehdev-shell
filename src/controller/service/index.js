/**
 * Service Model
 * @author ryan.bian
 */
const path = require('path');
const serviceStore = require('../command/serviceStore');
const Commander = require('../command/commander');
const {
  ConfigerFolderPath,
  SHELL_NODE_MODULES_PATH,
  APP_PATH,
} = require('../../utils/env');
const { readJSON, getLocalIP } = require('../../utils');
const context = require('../../context');
const notification = require('../../provider/notification/');

const serverScriptPath = path.join(APP_PATH, './child_service/server');
const builderScriptPath = path.join(APP_PATH, './child_service/builder');
const dllBuilderScriptPath = path.join(APP_PATH, './child_service/dllBuilder');

const nodeExecuteName = 'node';

exports.startServer = async (config) => {
  const { root, configerName, runtimeConfig } = config;
  const pkg = await readJSON(`${root}/package.json`);
  const { pid } = await Commander.run(`${nodeExecuteName} ${serverScriptPath}`, {
    cwd: root,
    parseResult: false,
    outputToTermnal: true,
    env: {
      SHELL_NODE_MODULES_PATH,
      CONFIGER_FOLDER_PATH: ConfigerFolderPath,
      CONFIGER_NAME: configerName,
      NODE_ENV: 'development',
      PATH: process.env.PATH,
      RUNTIME_CONFIG: JSON.stringify(runtimeConfig),
    },
    args: {
      projectName: pkg.name,
    },
  }, () => {
    notification({
      title: '服务已停止',
    }).show();
  });
  notification({
    title: '启动开发服务',
  }).show();
  context.getDataBase('workspace').update(
    {
      name: pkg.name,
    },
    {
      $inc: {
        serverCount: 1,
      },
    },
    { upsert: true }
  );
  const ip = getLocalIP();
  return {
    pid,
    ip,
  };
};

exports.stop = async (pid) => {
  if (!serviceStore.has(pid)) {
    return `process:${pid} is not running.`;
  } else {
    serviceStore.kill(pid).then(() => {
      serviceStore.delete(pid);
    });
    return null;
  }
};

exports.startBuilder = async (config) => {
  const { root, configerName, runtimeConfig } = config;
  let command;
  if (runtimeConfig.isDll) {
    command = `${nodeExecuteName} ${dllBuilderScriptPath}`;
  } else {
    command = `${nodeExecuteName} ${builderScriptPath}`;
  }
  const pkg = await readJSON(`${root}/package.json`);
  const { pid } = await Commander.run(command, {
    cwd: root,
    parseResult: false,
    outputToTermnal: true,
    env: {
      SHELL_NODE_MODULES_PATH,
      CONFIGER_FOLDER_PATH: ConfigerFolderPath,
      CONFIGER_NAME: configerName,
      NODE_ENV: 'production',
      PATH: process.env.PATH,
      RUNTIME_CONFIG: JSON.stringify(runtimeConfig),
    },
    args: {
      projectName: pkg.name,
    },
  }, () => {
    notification({
      title: '构建已停止',
    }).show();
  });
  notification({
    title: '开始构建',
  }).show();
  context.getDataBase('workspace').update(
    {
      name: pkg.name,
    },
    {
      $inc: {
        buildCount: 1,
      },
    },
    { upsert: true }
  );
  return {
    pid,
  };
};
