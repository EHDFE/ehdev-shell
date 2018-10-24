/**
 * Configer Model
 * @author ryan.bian
 */
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
// const Commander = require('../command/commander');
const { hasDir, hasFile, readJSON } = require('../../utils/');
const {
  ConfigerFolderPath,
  ConfigerFolderPackagePath,
} = require('../../utils/env');
const execute = require('../pty/execute');

const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

const initFolder = () => {
  hasFile(ConfigerFolderPackagePath).then(file => {
    if (!file) {
      execute('npm init --yes', {
        cwd: ConfigerFolderPath,
      });
    }
  });
};
hasDir(ConfigerFolderPath).then(dir => {
  if (dir) {
    initFolder();
  } else {
    mkdir(ConfigerFolderPath).then(() => {
      initFolder();
    });
  }
});

exports.getConfigs = async () => {
  const pkg = await readJSON(ConfigerFolderPackagePath);
  const deps = [];
  const configs = (pkg.dependencies && Object.keys(pkg.dependencies)) || [];
  for (const pkgName of configs) {
    if (pkgName.startsWith('ehdev-configer-')) {
      let readme, history;
      try {
        readme = await readFile(
          path.join(ConfigerFolderPath, `node_modules/${pkgName}/README.md`),
          'utf-8',
        );
      } catch (e) {
        /* ignore */
      }
      try {
        history = await readFile(
          path.join(ConfigerFolderPath, `node_modules/${pkgName}/CHANGELOG.md`),
          'utf-8',
        );
      } catch (e) {
        /* ignore */
      }
      try {
        const configPkg = await readJSON(
          path.join(ConfigerFolderPath, `node_modules/${pkgName}/package.json`),
        );
        deps.push({
          id: pkgName,
          name: pkgName,
          version: configPkg.version,
          description: configPkg.description,
          readme,
          history,
        });
      } catch (e) {
        /* ignore */
      }
    }
  }
  return deps;
};
exports.getRemoteConfigs = async () => {
  try {
    const result = execute('npm search --json ehdev-configer-', {
      cwd: ConfigerFolderPath,
      parseResult: true,
    });
    return result;
  } catch (e) {
    throw e;
  }
};
exports.add = async config => {
  const { configerName } = config;
  try {
    await execute(`npm i ${configerName} --save-exact --production`, {
      cwd: ConfigerFolderPath,
      parseResult: false,
    });
    return true;
  } catch (e) {
    throw e;
  }
};
exports.remove = async config => {
  const { configerName } = config;
  try {
    await execute(`npm uninstall ${configerName} -S --production`, {
      cwd: ConfigerFolderPath,
      parseResult: false,
    });
    return true;
  } catch (e) {
    throw e;
  }
};
exports.upgrade = async config => {
  const { configerName, version } = config;
  try {
    await execute(
      `npm i ${configerName}@${version} --save-exact --production`,
      {
        cwd: ConfigerFolderPath,
        parseResult: false,
      },
    );
    return true;
  } catch (e) {
    throw e;
  }
};
exports.getVersions = async pkgName => {
  try {
    const distTags = await execute(`npm view ${pkgName} dist-tags --json`, {
      parseResult: true,
    });
    const versions = await execute(`npm view ${pkgName} versions --json`, {
      parseResult: true,
    });
    const tagMap = {};
    Object.keys(distTags).forEach(key => {
      Object.assign(tagMap, {
        [distTags[key]]: key,
      });
    });
    return versions.map(v => ({
      version: v,
      tag: tagMap[v],
    }));
  } catch (e) {
    throw e;
  }
};
