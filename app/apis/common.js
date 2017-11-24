/**
 * common apis
 */
import { handleResponse } from './utils';

const API_PATH = '/api/common';

const COMMON_API = {
  wallpaper: {
    async getBingWallpaper(date) {
      const res = await fetch(`${API_PATH}/bingWallpaper/${date}`);
      return handleResponse(res);
    }
  }
};

export default COMMON_API;
