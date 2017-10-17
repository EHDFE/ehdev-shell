/**
 * reducer
 * @author ryan.bian
 */
import { combineReducers } from 'redux';

import { ProjectReducer } from './modules/module.project/';
import { UploadReducer } from './modules/module.upload/';

const reducer = combineReducers({
  'page.project': ProjectReducer,
  'page.upload': UploadReducer,
});

export default reducer;
