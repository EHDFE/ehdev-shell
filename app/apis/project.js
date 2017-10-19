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
    }
  },
  pkg: {
    async outdated(packageName) {
      const res = await fetch(`/outdated/${packageName}`, {
        method: 'post',
      });
      return handleResponse(res);
    }
  },
};

export default PROJECT_API;
