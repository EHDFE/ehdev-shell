/**
 * reducer
 * @author ryan.bian
 */
import { combineReducers } from 'redux';

import { ProjectReducer } from './modules/module.project/';
import { UploadReducer } from './modules/module.upload/';
import { ConfigerReducer } from './modules/module.configer/';

const reducer = combineReducers({
  'page.project': ProjectReducer,
  'page.upload': UploadReducer,
  'page.configer': ConfigerReducer,
});

export default reducer;
