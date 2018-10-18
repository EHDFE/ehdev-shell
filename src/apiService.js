/**
 * ApiService Class
 */
const { setRoot, makeRecord, updateConfig } = require('./controller/project/env');
const service = require('./controller/service/index');
const configer = require('./controller/configer/index');
const common = require('./controller/common/index');
const uploadList = require('./controller/upload/list');
const dashboard = require('./controller/dashboard/index');
const image = require('./controller/tools/image');
const reader = require('./controller/reader/');
const portal = require('./controller/portal/');

const providers = require('./provider');

const serviceStore = require('./controller/command/serviceStore');

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
  serviceStore,
  reader,
  portal,
};

module.exports = apiService;
