import { remoteAPI } from './utils';

const IMAGE_API = {
  process: async (input, plugin, options) => {
    try {
      const res = await remoteAPI.image.process(input, plugin, options);
      return res;
    } catch (e) {
      throw e;
    }
  },
  getSSIMScore: async (input1, input2) => {
    try {
      const res = await remoteAPI.image.getSSIMScore(input1, input2);
      return res;
    } catch (e) {
      throw e;
    }
  },
  resize: async (inputPath, maxWidth, maxHeight) => await remoteAPI.image.resize(inputPath, maxWidth, maxHeight),
};

export default IMAGE_API;
