/**
 * project apis
 * @author ryan.bian
 */
import { remoteAPI } from './utils';

const PROJECT_API = {
  root: {
    async post(rootPath) {
      return await remoteAPI.root.setRoot(rootPath);
    },
    async makeRecord(rootPath) {
      return await remoteAPI.root.makeRecord(rootPath);
    },
  },
};

export default PROJECT_API;
