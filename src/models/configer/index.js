/**
 * Configer Model
 * @author ryan.bian
 */
const path = require('path');
const Commander = require('../../service/commander');
const { hasDir, hasFile, mkdir, readJSON, readFile } = require('../../utils/');
const { ConfigerFolderPath, ConfigerFolderPackagePath } = require('../../utils/env');
// const context = require('../../context');

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


// class ConfigerAPI {
//   async getConfigs(ctx) {
//     const pkg = await readJSON(ConfigerFolderPackagePath);
//     const deps = [];
//     const configs = pkg.dependencies && Object.keys(pkg.dependencies) || [];
//     for (const pkgName of configs) {
//       if (pkgName.startsWith('ehdev-configer-')) {
//         let readme, history;
//         try {
//           readme = await readFile(path.join(ConfigerFolderPath, `node_modules/${pkgName}/README.md`), 'utf-8');
//         } catch (e) { /* ignore */ }
//         try {
//           history = await readFile(path.join(ConfigerFolderPath, `node_modules/${pkgName}/CHANGELOG.md`), 'utf-8');
//         } catch (e) { /* ignore */ }
//         try {
//           const configPkg = await readJSON(path.join(ConfigerFolderPath, `node_modules/${pkgName}/package.json`));
//           deps.push({
//             id: pkgName,
//             name: pkgName,
//             version: configPkg.version,
//             description: configPkg.description,
//             readme,
//             history,
//           });
//         } catch (e) { /* ignore */ }
//       }
//     }
//     ctx.body = ctx.app.responser(deps, true);
//   }
//   async getRemoteConfigs(ctx) {
//     try {
//       const result = await Commander.run('npm search --json ehdev-configer-', {
//         cwd: ConfigerFolderPath,
//         // webContent: ctx.app.webContent,
//         useCnpm: false,
//       });
//       ctx.body = ctx.app.responser(result, true);
//     } catch (e) {
//       ctx.body = ctx.app.responser(e.toString(), false);
//     }
//   }
//   async add(ctx) {
//     const { configerName } = ctx.request.body;
//     try {
//       const { pid } = await Commander.run(`npm i ${configerName} --save-exact --production`, {
//         cwd: ConfigerFolderPath,
//         webContent: ctx.app.webContent,
//         parseResult: false,
//       });
//       ctx.body = ctx.app.responser({
//         installPid: pid,
//       }, true);
//     } catch (e) {
//       ctx.body = ctx.app.responser(e.toString(), false);
//     }
//   }
//   upload(ctx) {

//   }
//   async remove(ctx) {
//     const { configName } = ctx.params;
//     try {
//       const { pid } = await Commander.run(`npm uninstall ${configName} -S --production`, {
//         cwd: ConfigerFolderPath,
//         webContent: ctx.app.webContent,
//         parseResult: false,
//       });
//       ctx.body = ctx.app.responser({
//         removePid: pid,
//       }, true);
//     } catch (e) {
//       ctx.body = ctx.app.responser(e.toString(), false);
//     }
//   }
//   async upgrade(ctx) {
//     const { configerName, version } = ctx.request.body;
//     try {
//       const { pid } = await Commander.run(`npm i ${configerName}@${version} --save-exact --production`, {
//         cwd: ConfigerFolderPath,
//         webContent: ctx.app.webContent,
//         parseResult: false,
//       });
//       ctx.body = ctx.app.responser({
//         upgradePid: pid,
//       }, true);
//     } catch (e) {
//       ctx.body = ctx.app.responser(e.toString(), false);
//     }
//   }
// }

// module.exports = ConfigerAPI;
