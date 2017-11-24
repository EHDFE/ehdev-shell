/**
 * reducer
 * @author ryan.bian
 */
import { combineReducers } from 'redux';

import { ProjectReducer } from './modules/module.project/';
import { DashboardReducer } from './modules/module.dashboard/';
import { UploadReducer } from './modules/module.upload/';
import { ConfigerReducer } from './modules/module.configer/';
import { ConsoleReducer } from './modules/module.console/';
import { UserReducer } from './modules/module.user/';
import { ProcessReducer } from './modules/module.process';
import { LayoutReducer } from './modules/module.layout/';

const reducer = combineReducers({
  'page.dashboard': DashboardReducer,
  'page.project': ProjectReducer,
  'page.upload': UploadReducer,
  'page.configer': ConfigerReducer,
  'page.console': ConsoleReducer,
  'page.user': UserReducer,
  'page.process': ProcessReducer
  'page.wallpaper': LayoutReducer,
});

export default reducer;
