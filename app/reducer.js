/**
 * reducer
 * @author ryan.bian
 */
import { combineReducers } from 'redux';
import { default as ConfigerReducer } from './modules/module.configer/store';
import { default as ConsoleReducer } from './modules/module.console/store';
import { default as DashboardReducer } from './modules/module.dashboard/store';
import { default as ProjectReducer } from './modules/module.project/store';
import { default as QrcodeReducer } from './modules/module.qrcode/store';
import { default as UploadReducer } from './modules/module.upload/store';
import { default as UserReducer } from './modules/module.user/store';
import { default as ImageProcessReducer } from './modules/module.image.process/store';
import { default as SettingReducer } from './modules/module.setting/store';

const reducer = combineReducers({
  'page.dashboard': DashboardReducer,
  'page.project': ProjectReducer,
  'page.upload': UploadReducer,
  'page.configer': ConfigerReducer,
  'page.console': ConsoleReducer,
  'page.user': UserReducer,
  'page.setting': SettingReducer,
  'page.qrcode': QrcodeReducer,
  'page.image.process': ImageProcessReducer,
});

export default reducer;
