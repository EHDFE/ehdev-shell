/**
 * Service API
 * @author ryan.bian
 */
import { remoteAPI } from './utils';

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
