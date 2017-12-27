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
      // const res = await fetch(`${PROJECT_PATH}/config/${encodeURIComponent(rootPath)}`, {
      //   method: 'put',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(config),
      // });
      // return handleResponse(res, {
      //   errorNotification: true,
      //   successNotification: true,
      //   successMsg: '更新成功!',
      // });
    }
  },
  pkg: {
    async outdated(packageName) {
      try {
        const res = await remoteAPI.npm.outdated(
          packageName ? packageName + '/' : '',
        );
        return res;
      } catch (e) {
        throw e;
      }
    },
    async getAllVersions(rootPath) {
      try {
        const res = await remoteAPI.npm.allVersions('', {
          rootPath,
        });
        return res;
      } catch (e) {
        throw e;
      }
    }
  },
};

export default PROJECT_API;
