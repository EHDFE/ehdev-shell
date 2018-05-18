/**
 * Service Model
 * @author ryan.bian
 */
const path = require('path');
// const { app } = require('electron');
const { serviceStore } = require('../../service/index');
const Commander = require('../../service/commander');
const {
  ConfigerFolderPath,
  SHELL_NODE_MODULES_PATH,
  APP_PATH,
} = require('../../utils/env');
const { readJSON, getLocalIP } = require('../../utils');
const context = require('../../context');

const serverScriptPath = path.join(APP_PATH, './child_service/server');
const builderScriptPath = path.join(APP_PATH, './child_service/builder');
const dllBuilderScriptPath = path.join(APP_PATH, './child_service/dllBuilder');
const { platform } = require('os');

const isWin = platform() === 'win32';
const nodeExecuteName = isWin ? 'node.exe' : 'node';

exports.startServer = async (config) => {
  const { root, configerName, runtimeConfig } = config;
  const pkg = await readJSON(`${root}/package.json`);
  const { pid } = await Commander.run(`${nodeExecuteName} ${serverScriptPath}`, {
    cwd: root,
    parseResult: false,
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
  });
  context.getDataBase('project').update(
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
    serviceStore.delete(pid);
    return null;
  }
};

exports.startBuilder = async (config) => {
  const { root, configerName, isDll } = config;
  let command;
  if (isDll) {
    command = `${nodeExecuteName} ${dllBuilderScriptPath}`;
  } else {
    command = `${nodeExecuteName} ${builderScriptPath}`;
  }
  const pkg = await readJSON(`${root}/package.json`);
  const { pid } = await Commander.run(command, {
    cwd: root,
    parseResult: false,
    env: {
      SHELL_NODE_MODULES_PATH,
      CONFIGER_FOLDER_PATH: ConfigerFolderPath,
      CONFIGER_NAME: configerName,
      NODE_ENV: 'production',
      PATH: process.env.PATH,
    },
    args: {
      projectName: pkg.name,
    },
  });
  context.getDataBase('project').update(
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
  return {
    pid,
  };
};
