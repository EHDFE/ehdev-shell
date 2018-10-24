/**
 * ApiService Class
 */
const {
  setRoot,
  makeRecord,
  updateConfig,
} = require('./controller/project/env');
const service = require('./controller/service/index');
const configer = require('./controller/configer/index');
const common = require('./controller/common/index');
const uploadList = require('./controller/upload/list');
const dashboard = require('./controller/dashboard/index');
const image = require('./controller/tools/image');
const portal = require('./controller/portal/');
const PTY = require('./controller/pty/');

const providers = require('./provider');

const apiService = {
  root: {
    setRoot,
    makeRecord,
  },
  config: {
    updateConfig,
  },
  service,
  configer,
  common,
  upload: {
    getList: uploadList.get,
    updateList: uploadList.post,
    deleteList: uploadList.del,
  },
  dashboard,
  providers,
  image,
  portal,
  pty: PTY,
};

module.exports = apiService;
