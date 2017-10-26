/**
 * Service API
 * @author ryan.bian
 */
import { handleResponse } from './utils';

const SERVICE_PATH = '/api/service';

const SERVICE_API = {
  server: {
    async start(params) {
      const res = await fetch(`${SERVICE_PATH}/server`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      return handleResponse(res);
    },
    async stop(pid) {
      const res = await fetch(`${SERVICE_PATH}/server/${pid}`, {
        method: 'delete',
      });
      return handleResponse(res);
    },
  },
  builder: {},
};

export default SERVICE_API;
