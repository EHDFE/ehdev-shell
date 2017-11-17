/**
 * project apis
 * @author ryan.bian
 */
import { handleResponse } from './utils';

const PROJECT_PATH = '/api/project';

const PROJECT_API = {
  root: {
    async post(rootPath) {
      const res = await fetch(`${PROJECT_PATH}/root/${encodeURIComponent(rootPath)}`, {
        method: 'post',
      });
      return handleResponse(res);
    },
    async makeRecord(rootPath) {
      const res = await fetch(`${PROJECT_PATH}/root/record/${encodeURIComponent(rootPath)}`, {
        method: 'put',
      });
      return handleResponse(res);
    },
    async editConfig(configs) {
      const {rootPath, ...config} = configs;
      const res = await fetch(`${PROJECT_PATH}/config/${encodeURIComponent(rootPath)}`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      return handleResponse(res, {
        errorNotification: true,
        successNotification: true,
        successMsg: '更新成功!',
      });
    }
  },
  pkg: {
    async outdated(packageName) {
      const res = await fetch(`/api/npm/outdated/${packageName ? packageName + '/' : ''}`, {
        method: 'post',
      });
      return handleResponse(res);
    },
    async getAllVersions(rootPath) {
      const res = await fetch('/api/npm/allVersions/', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({rootPath})
      });
      return handleResponse(res, {
        errorNotification: false,
        successNotification: false,
        successMsg: 'Successful!',
      });
    }
  },
};

export default PROJECT_API;
