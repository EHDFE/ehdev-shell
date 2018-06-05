/**
 * ApiService Class
 */
const { setRoot, makeRecord, updateConfig } = require('./models/project/env');
const npm = require('./models/project/npm');
const service = require('./models/service/index');
const configer = require('./models/configer/index');
const common = require('./models/common/index');
const uploadList = require('./models/upload/list');
const dashboard = require('./models/dashboard/index');
const imagemin = require('./models/tools/imagemin');

const providers = require('./provider');

const { serviceStore } = require('./service/index');

const apiService = {
  root: {
    setRoot,
    makeRecord,
  },
  config: {
    updateConfig,
  },
  npm,
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
  imagemin,
  serviceStore,
};

module.exports = apiService;
