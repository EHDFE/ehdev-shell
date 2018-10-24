/**
 * dashboard apis
 * @author ryan.bian
 */
import { remoteAPI } from './utils';

const DASHBOARD_API = {
  projects: {
    async getList() {
      try {
        const res = await remoteAPI.dashboard.getProjectList();
        return res;
      } catch (e) {
        throw e;
      }
    },
  },
  overall: {
    async get() {
      try {
        const res = await remoteAPI.dashboard.getOverall();
        return res;
      } catch (e) {
        throw e;
      }
    },
  },
  // wallPaper: {
  //   async get(date) {
  //     const res = await fetch(`${API_PATH}/dailyWallpaper/${date ? date : ''}`);
  //     return handleResponse(res);
  //   }
  // },
};

export default DASHBOARD_API;
