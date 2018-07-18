/**
 * This model is for executing npm commands
 * @author ryan.bian
 * TODO:
 * 1. support the global configeration: registry
 */
const Commander = require('../command/commander');

/**
 * install dependence
 */
exports.install = async (packageName = '', env) => {
  const { rootPath, args } = env;
  const packageList = [];
  if (Array.isArray(packageName)) {
    packageName.forEach(d => {
      packageList.push(d);
    });
  } else {
    packageList.push(packageName);
  }
  try {
    const data = await Commander.run(`npm i ${packageList.join(' ')} ${args || ''}`, {
      cwd: rootPath,
      parseResult: 'string',
    });
    let success = true;
    if (/ERR/.test(data)) {
      success = false;
    }
    return {
      success,
      data,
    };
  } catch (e) {
    return {
      success: false,
      data: e.toString(),
    };
  }
};

exports.uninstall = async (packageName = '', env) => {
  const { rootPath, args } = env;
  try {
    const data = await Commander.run(
      `npm uninstall ${packageName} ${args || ''}`,
      {
        cwd: rootPath,
        parseResult: 'string',
      }
    );
    return {
      success: true,
      data,
    };
  } catch (e) {
    return {
      success: false,
      data: e.toString(),
    };
  }
};

exports.update = async (rootPath) => {
  try {
    const data = await Commander.run('npm update', {
      cwd: rootPath,
      parseResult: 'string',
    });
    return {
      success: true,
      data,
    };
  } catch (e) {
    return {
      success: false,
      data: e.toString(),
    };
  }
};

exports.ls = async (packageName = '', env) => {
  const { rootPath, args } = env;
  try {
    const result = await Commander.run(
      `npm ls ${packageName} --json --depth=0 ${args || ''}`,
      {
        cwd: rootPath,
      }
    );
    return result;
  } catch (e) {
    throw e;
  }
};

/**
 * Check for outdated packages
 */
exports.outdated = async (packageName = '', env) => {
  const { rootPath, args } = env;
  try {
    const result = await Commander.run(
      `npm outdated ${packageName} --json ${args || ''}`,
      {
        cwd: rootPath,
      }
    );
    return result;
  } catch (e) {
    throw e;
  }
};
/**
 * All packages versions
 */
exports.allVersions = async (packageName = '', env) => {
  const { rootPath, args } = env;
  try {
    const [outdatedList, list] = await Promise.all([
      Commander.run(`npm outdated ${packageName} --json ${args || ''}`, {
        cwd: rootPath,
      }),
      Commander.run(`npm ls ${packageName} --json --depth=0 ${args || ''}`, {
        cwd: rootPath,
      }),
    ]);
    let result = { versions: {} };
    for (const prop in list.dependencies) {
      if (prop in outdatedList) {
        result.versions[prop] = {
          current: outdatedList[prop].current,
          wanted: outdatedList[prop].wanted,
          latest: outdatedList[prop].latest,
          outdated: true,
        };
      } else if (list.dependencies[prop]['version']) {
        result.versions[prop] = {
          current: list.dependencies[prop]['version'],
          wanted: list.dependencies[prop]['version'],
          latest: list.dependencies[prop]['version'],
          outdated: false,
        };
      } else if (list.dependencies[prop]['peerMissing']) {
        result.versions[prop] = {
          current: list.dependencies[prop]['required']['version'],
          wanted: list.dependencies[prop]['required']['version'],
          latest: list.dependencies[prop]['required']['version'],
          outdated: false,
          peerMissing: list.dependencies[prop]['required']['peerMissing'],
        };
      }
    }
    return Object.assign(result, list);
  } catch (e) {
    throw e;
  }
};
