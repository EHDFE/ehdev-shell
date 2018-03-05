/**
 * reducer
 * @author ryan.bian
 */
import { combineReducers } from 'redux';

import { default as ProjectReducer } from './modules/module.project/store';
import { default as DashboardReducer } from './modules/module.dashboard/store';
import { default as UploadReducer } from './modules/module.upload/store';
import { default as ConfigerReducer } from './modules/module.configer/store';
import { default as ConsoleReducer } from './modules/module.console/store';
import { default as UserReducer } from './modules/module.user/store';
// import { default as ImageReducer } from './modules/module.image/store';
import { default as LayoutReducer } from './modules/module.layout/store';
import { default as QrcodeReducer } from './modules/module.qrcode/store';
import { default as PomodoraReducer } from './modules/module.pomodora/store';

const reducer = combineReducers({
  'page.dashboard': DashboardReducer,
  'page.project': ProjectReducer,
  'page.upload': UploadReducer,
  'page.configer': ConfigerReducer,
  'page.console': ConsoleReducer,
  'page.user': UserReducer,
  // 'page.image': ImageReducer,
  'page.wallpaper': LayoutReducer,
  'page.qrcode': QrcodeReducer,
  'page.pomodora': PomodoraReducer,
});

export default reducer;
