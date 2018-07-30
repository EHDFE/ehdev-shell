import { remoteAPI } from './utils';

const IMAGE_API = {
  start: async () => {
    try {
      const host = await remoteAPI.portal.start();
      return host;
    } catch (e) {
      throw e;
    }
  },
  stop: () => remoteAPI.portal.stop(),
  open: async filePaths => await remoteAPI.portal.open(filePaths),
  close: id => remoteAPI.portal.close(id),
  getPool: () => remoteAPI.portal.getPool(),
  getState: () => ({
    running: remoteAPI.portal.listening,
    host: remoteAPI.portal.host,
  }),
};

export default IMAGE_API;
