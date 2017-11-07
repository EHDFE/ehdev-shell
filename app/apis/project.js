/**
 * project apis
 * @author ryan.bian
 */
import { handleResponse, serialize } from './utils';

const PROJECT_PATH = '/api/project';

const PROJECT_API = {
  root: {
    async put(rootPath) {
      const res = await fetch(`${PROJECT_PATH}/root/${encodeURIComponent(rootPath)}`, {
        method: 'put',
      });
      return handleResponse(res);
    },
    async set(configs) {
      const {rootPath,...config} = configs;
      const res = await fetch(`${PROJECT_PATH}/config/${encodeURIComponent(rootPath)}`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `config=${JSON.stringify(config)}`,
      });
      return handleResponse(res, {
        successNotification: true,
        successMsg: '更新成功！',
      });
    }
  },
  pkg: {
    async outdated(packageName) {
      const res = await fetch(`/api/npm/outdated/${packageName?packageName+'/':''}`, {
        method: 'post',
      });
      return handleResponse(res);
    }
  },
};

export default PROJECT_API;
