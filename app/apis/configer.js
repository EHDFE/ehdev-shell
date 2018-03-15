/**
 * configer apis
 * @author ryan.bian
 */
// import { handleResponse } from './utils';

// const API_PATH = '/api/configer';
import { remote } from 'electron';

let remoteAPI;
if (process.env.NODE_ENV === 'production') {
  remoteAPI = remote.require('./main-build/apiService');
} else {
  remoteAPI = remote.require('../src/apiService');
}

const CONFIGER_API = {
  async get() {
    try {
      const res = await remoteAPI.configer.getConfigs();
      return res;
    } catch (e) {
      throw e;
    }
  },
  async getConfigsFromNpm() {
    try {
      const res = await remoteAPI.configer.getRemoteConfigs();
      return res;
    } catch (e) {
      throw e;
    }
  },
  async add(configerName) {
    try {
      const res = await remoteAPI.configer.add({
        configerName,
      });
      return res;
    } catch (e) {
      throw e;
    }
  },
  async upload(files) {

  },
  async remove(configerName) {
    if (!configerName) return Promise.reject('no config name provided!');
    try {
      const res = await remoteAPI.configer.remove({
        configerName,
      });
      return res;
    } catch (e) {
      throw e;
    }
  },
  async upgrade(configerName, version) {
    try {
      const res = await remoteAPI.configer.upgrade({
        configerName,
        version,
      });
      return res;
    } catch (e) {
      throw e;
    }
  },
  async getVersions(pkgName) {
    try {
      const versions = await remoteAPI.configer.getVersions(pkgName);
      return versions;
    } catch (e) {
      throw e;
    }
  }
};

export default CONFIGER_API;
