/**
 * ApiService Class
 */
const { setRoot, makeRecord, setConfig } = require('./models/project/env');
const npm = require('./models/project/npm');
const service = require('./models/service/index');
const configer = require('./models/configer/index');
const common = require('./models/common/index');
const uploadList = require('./models/upload/list');
const dashboard = require('./models/dashboard/index');
const imageMin = require('./models/image/index');

const apiService = {
  root: {
    setRoot,
    makeRecord,
  },
  config: {
    setConfig,
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
  imageMin
};

module.exports = apiService;
