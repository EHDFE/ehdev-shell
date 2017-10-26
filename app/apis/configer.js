/**
 * configer apis
 * @author ryan.bian
 */
import { handleResponse } from './utils';

const API_PATH = '/api/configer';

const CONFIGER_API = {
  async get() {
    const res = await fetch(`${API_PATH}/configs`);
    return handleResponse(res);
  },
  async getConfigsFromNpm() {
    const res = await fetch(`${API_PATH}/remoteConfigs`);
    return handleResponse(res);
  },
  async add(configerName) {
    const res = await fetch(`${API_PATH}/config`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        configerName,
      }),
    });
    return handleResponse(res);
  },
  async upload(files) {

  },
  async remove(id) {
    if (!id) return Promise.reject('no config id provided!');
    const res = await fetch(`${API_PATH}/config/${id}`, {
      method: 'delete',
    });
    return handleResponse(res);
  },
  async upgrade(id) {

  }
};

export default CONFIGER_API;
