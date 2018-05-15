/**
 * common apis
 */
// import { handleResponse } from './utils';

// const API_PATH = '/api/common';
import { remote } from 'electron';

let remoteAPI;
if (process.env.NODE_ENV === 'production') {
  remoteAPI = remote.require('./main-build/apiService');
} else {
  remoteAPI = remote.require('../src/apiService');
}

const COMMON_API = {
  // wallpaper: {
  //   async getBingWallpaper(date) {
  //     try {
  //       const res = await remoteAPI.common.getBingWallpaper(date);
  //       return res;
  //     } catch (e) {
  //       throw e;
  //     }
  //   }
  // },
  async getQrCode(text) {
    try {
      const res = await remoteAPI.common.getQRCode(text);
      return res;
    } catch (e) {
      throw e;
    }
  },
  // async getESlintResult(cwd) {
  //   try {
  //     const res = await remoteAPI.common.runESlint(cwd);
  //     return res;
  //   } catch (e) {
  //     throw e;
  //   }
  // },
};

export default COMMON_API;
