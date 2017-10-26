/**
 * upload apis
 * @author ryan.bian
 */
import { handleResponse, serialize } from './utils';

const LIST_PATH = '/api/upload/list';
const FILE_PATH = '/api/upload/file';

const UPLOAD_API = {
  list: {
    async get(params = {
      start: 0,
      limit: 100,
    }) {
      const urlParams = serialize(params);
      const res = await fetch(`${LIST_PATH}/?${urlParams}`);
      return handleResponse(res);
    },
    async post(files) {
      const res = await fetch(`${LIST_PATH}/`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `files=${JSON.stringify(files)}`,
      });
      return handleResponse(res, {
        successNotification: true,
        successMsg: '上传成功！',
      });
    },
    async del(ids) {
      const res = await fetch(`${LIST_PATH}/${ids.join(',')}`, {
        method: 'delete',
      });
      return handleResponse(res);
    }
  },
  file: {
    async post(file) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(FILE_PATH, {
        method: 'post',
        body: fd,
      });
      return handleResponse(res);
    },
  },
};

export default UPLOAD_API;
