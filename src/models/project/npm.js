/**
 * This model is for executing npm commands
 * @author ryan.bian
 * TODO:
 * 1. support the global configeration: registry
 */
const Commander = require('../../service/commander');

/**
 * install dependence
 */
exports.install = async (packageName = '', env) => {
  const { rootPath, args, version, packages } = env;
  let packageList = '';
  if (packageName) {
    packageList = `${packageName}@${version ? version : 'latest'}`;
  } else if (packages) {
    if (Array.isArray(packages)) {
      packages.forEach(d => {
        packageList += ` ${d.packageName}@${d.version
          ? d.version
          : 'latest'}`;
      });
    }
  }
  const data = await Commander.run(`npm i ${packageList} ${args || ''}`, {
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
};

exports.uninstall = async (packageName = '', env) => {
  const { rootPath, args } = env;
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
