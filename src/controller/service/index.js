/**
 * Service Model
 * @author ryan.bian
 */
const path = require('path');
const {
  ConfigerFolderPath,
  SHELL_NODE_MODULES_PATH,
  APP_PATH,
} = require('../../utils/env');
const { getLocalIP, readJSON, killTask } = require('../../utils');
const context = require('../../context');
const notification = require('../../provider/notification/');

const serverScriptPath = path.join(APP_PATH, './child_service/server');
const builderScriptPath = path.join(APP_PATH, './child_service/builder');
const dllBuilderScriptPath = path.join(APP_PATH, './child_service/dllBuilder');

const nodeExecuteName = 'node';

const PTY = require('../pty/');

const initPty = options => new PTY(options);

const createExecuteArguments = config => {
  return Object.keys(config)
    .map(key => {
      let value = config[key];
      if (typeof value === 'string') {
        value = value.replace(/\s/g, '\\ ');
      }
      return [`--${key}`, value].join('=');
    })
    .join(' ');
};

const DEFAULT_ARGUMENT = {
  SHELL_NODE_MODULES_PATH,
  CONFIGER_FOLDER_PATH: ConfigerFolderPath,
};

exports.startServer = async config => {
  const { root, configerName, runtimeConfig, ppid } = config;
  const pkg = await readJSON(`${root}/package.json`);
  let pty;
  if (ppid && PTY.pool.has(ppid)) {
    pty = PTY.pool.get(ppid);
  } else {
    pty = initPty({
      cwd: root,
    });
  }
  const argv = createExecuteArguments({
    ...DEFAULT_ARGUMENT,
    ...runtimeConfig,
    configerName,
    env: 'development',
  });
  pty.write(`${nodeExecuteName} ${serverScriptPath} ${argv}\n`);
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
    { upsert: true },
  );
  const ip = getLocalIP();
  return {
    ppid: pty.process.pid,
    ip,
  };
};

exports.stop = async ppid => {
  return await killTask(ppid);
};

exports.startBuilder = async config => {
  const { root, configerName, runtimeConfig, ppid } = config;
  const pkg = await readJSON(`${root}/package.json`);
  let pty;
  if (ppid && PTY.pool.has(ppid)) {
    pty = PTY.pool.get(ppid);
  } else {
    pty = initPty({
      cwd: root,
    });
  }
  const argv = createExecuteArguments({
    ...DEFAULT_ARGUMENT,
    ...runtimeConfig,
    configerName,
    env: 'production',
  });
  let command;
  if (runtimeConfig.isDll) {
    command = `${nodeExecuteName} ${dllBuilderScriptPath} ${argv}\n`;
  } else {
    command = `${nodeExecuteName} ${builderScriptPath} ${argv}\n`;
  }
  pty.write(command);
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
    { upsert: true },
  );
  return {
    ppid: pty.process.pid,
  };
};

exports.closePty = async ppid => {
  if (!PTY.pool.has(ppid)) return true;
  const pty = PTY.pool.get(ppid);
  return await pty.exit();
};
