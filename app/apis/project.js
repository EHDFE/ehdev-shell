/**
 * project apis
 * @author ryan.bian
 */
// import { handleResponse } from './utils';
import { remote } from 'electron';

let remoteAPI;
if (process.env.NODE_ENV === 'production') {
  remoteAPI = remote.require('./main-build/apiService');
} else {
  remoteAPI = remote.require('../src/apiService');
}

// const PROJECT_PATH = '/api/project';

const PROJECT_API = {
  root: {
    async post(rootPath) {
      try {
        const res = await remoteAPI.root.setRoot(rootPath);
        return res;
      } catch (e) {
        throw e;
      }
    },
    async makeRecord(rootPath) {
      try {
        const res = await remoteAPI.root.makeRecord(rootPath);
        return res;
      } catch (e) {
        throw e;
      }
    },
    // TODO: success notification
    async editConfig(configs) {
      const { rootPath, ...config } = configs;
      try {
        const res = remote.config.setConfig(rootPath, config);
        return res;
      } catch (e) {
        throw e;
      }
    }
  },
  pkg: {
    async install(packageName, env) {
      return await remoteAPI.npm.install(packageName, env);
    },
    async uninstall(packageName, env) {
      return await remoteAPI.npm.uninstall(packageName, env);
    },
    async update(rootPath) {
      return await remoteAPI.npm.update(rootPath);
    },
    async outdated(packageName) {
      return await remoteAPI.npm.outdated(
        packageName ? packageName + '/' : '',
      );
    },
    async getAllVersions(rootPath) {
      return await remoteAPI.npm.allVersions('', {
        rootPath,
      });
    }
  },
};

export default PROJECT_API;
