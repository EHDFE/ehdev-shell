/**
 * Configer Model
 * @author ryan.bian
 */
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const Commander = require('../../service/commander');
const { hasDir, hasFile, readJSON } = require('../../utils/');
const { ConfigerFolderPath, ConfigerFolderPackagePath } = require('../../utils/env');

const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

const initFolder = () => {
  hasFile(ConfigerFolderPackagePath).then(file => {
    if (!file) {
      Commander.run('npm init --yes', {
        cwd: ConfigerFolderPath,
      });
    }
  });
};
hasDir(ConfigerFolderPath).then(dir => {
  if (dir) {
    initFolder();
  } else {
    mkdir(ConfigerFolderPath)
      .then(() => {
        initFolder();
      });
  }
});

exports.getConfigs = async () => {
  const pkg = await readJSON(ConfigerFolderPackagePath);
  const deps = [];
  const configs = pkg.dependencies && Object.keys(pkg.dependencies) || [];
  for (const pkgName of configs) {
    if (pkgName.startsWith('ehdev-configer-')) {
      let readme, history;
      try {
        readme = await readFile(path.join(ConfigerFolderPath, `node_modules/${pkgName}/README.md`), 'utf-8');
      } catch (e) { /* ignore */ }
      try {
        history = await readFile(path.join(ConfigerFolderPath, `node_modules/${pkgName}/CHANGELOG.md`), 'utf-8');
      } catch (e) { /* ignore */ }
      try {
        const configPkg = await readJSON(path.join(ConfigerFolderPath, `node_modules/${pkgName}/package.json`));
        deps.push({
          id: pkgName,
          name: pkgName,
          version: configPkg.version,
          description: configPkg.description,
          readme,
          history,
        });
      } catch (e) { /* ignore */ }
    }
  }
  return deps;
};
exports.getRemoteConfigs = async () => {
  try {
    const result = await Commander.run('npm search --json ehdev-configer-', {
      cwd: ConfigerFolderPath,
      useCnpm: false,
    });
    return result;
  } catch (e) {
    throw e;
  }
};
exports.add = async config => {
  const { configerName } = config;
  try {
    const { pid } = await Commander.run(`npm i ${configerName} --save-exact --production`, {
      cwd: ConfigerFolderPath,
      parseResult: false,
    });
    return {
      installPid: pid,
    };
  } catch (e) {
    throw e;
  }
};
exports.remove = async config => {
  const { configerName } = config;
  try {
    const { pid } = await Commander.run(`npm uninstall ${configerName} -S --production`, {
      cwd: ConfigerFolderPath,
      parseResult: false,
    });
    return {
      removePid: pid,
    };
  } catch (e) {
    throw e;
  }
};
exports.upgrade = async config => {
  const { configerName, version } = config;
  try {
    const { pid } = await Commander.run(`npm i ${configerName}@${version} --save-exact --production`, {
      cwd: ConfigerFolderPath,
      parseResult: false,
    });
    return {
      upgradePid: pid,
    };
  } catch (e) {
    throw e;
  }
};
exports.getVersions = async pkgName => {
  try {
    const distTags = await Commander.run(`npm view ${pkgName} dist-tags --json`);
    const versions = await Commander.run(`npm view ${pkgName} versions --json`);
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
