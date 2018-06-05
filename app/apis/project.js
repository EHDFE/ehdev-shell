/**
 * project apis
 * @author ryan.bian
 */
import { remoteAPI } from './utils';

const PROJECT_API = {
  root: {
    async post(rootPath) {
      try {
        const res = await remoteAPI.root.setRoot(rootPath);
        return res;
      } catch (e) {
        throw e;
      }
    },
    async makeRecord(rootPath) {
      try {
        const res = await remoteAPI.root.makeRecord(rootPath);
        return res;
      } catch (e) {
        throw e;
      }
    },
    async saveConfig(configs) {
      const { rootPath, content } = configs;
      try {
        const res = await remoteAPI.config.updateConfig(rootPath, content);
        return res;
      } catch (e) {
        throw e;
      }
    }
  },
  pkg: {
    async install(packageName, env) {
      return await remoteAPI.npm.install(packageName, env);
    },
    async uninstall(packageName, env) {
      return await remoteAPI.npm.uninstall(packageName, env);
    },
    async update(rootPath) {
      return await remoteAPI.npm.update(rootPath);
    },
    async outdated(packageName) {
      return await remoteAPI.npm.outdated(
        packageName ? packageName + '/' : '',
      );
    },
    async getAllVersions(rootPath) {
      return await remoteAPI.npm.allVersions('', {
        rootPath,
      });
    }
  },
};

export default PROJECT_API;
