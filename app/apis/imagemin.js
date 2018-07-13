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
  getSSIMScore: async (input1, input2) => {
    try {
      const res = await remoteAPI.imagemin.getSSIMScore(input1, input2);
      return res;
    } catch (e) {
      throw e;
    }
  },
};

export default IMAGE_MIN_API;
