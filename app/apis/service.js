/**
 * Service API
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

// const SERVICE_PATH = '/api/service';

const SERVICE_API = {
  server: {
    async start(params) {
      try {
        const res = await remoteAPI.service.startServer(params);
        return res;
      } catch (e) {
        throw e;
      }
    },
    async stop(pid) {
      try {
        const res = await remoteAPI.service.stop(pid);
        return res;
      } catch (e) {
        throw e;
      }
    },
  },
  builder: {
    async start(params) {
      try {
        const res = await remoteAPI.service.startBuilder(params);
        return res;
      } catch (e) {
        throw e;
      }
    },
    async stop(pid) {
      try {
        const res = await remoteAPI.service.stop(pid);
        return res;
      } catch (e) {
        throw e;
      }
    },
  },
};

export default SERVICE_API;
