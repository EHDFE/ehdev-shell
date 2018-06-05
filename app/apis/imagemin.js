import { remoteAPI } from './utils';

const IMAGE_MIN_API = {
  process: async (input, plugin, options) => {
    try {
      const res = await remoteAPI.imagemin.process(input, plugin, options);
      return res;
    } catch (e) {
      throw e;
    }
  },
  processBuffer: async (buffer) => {
    try {
      const res = await remoteAPI.imagemin.processBuffer(buffer);
      return res;
    } catch (e) {
      throw e;
    }
  },
};

export default IMAGE_MIN_API;
