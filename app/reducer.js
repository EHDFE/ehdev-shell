/**
 * reducer
 * @author ryan.bian
 */
import { combineReducers } from 'redux';

import { DashboardReducer } from './modules/module.dashboard/';
import { UploadReducer } from './modules/module.upload/';

const reducer = combineReducers({
  'page.dashboard': DashboardReducer,
  'page.upload': UploadReducer,
});

export default reducer;
