/**
 * Console Store
 * @author hefan
 */
import { combineReducers } from 'redux';
import { createActions, handleActions } from 'redux-actions';

import PROJECT_API from '../../apis/project';
import SERVICE_API from '../../apis/service';

const defaultState = {
  server: {
    log: ''
  }
};



/**
 * Console's action
 */
export const actions = createActions({
  SERVICE: {
    UPDATE_LOG: log => {
      return {
        log,
      };
    }
  }
});



/**
 * Console's  reducer
 */
const serviceReducer = handleActions({
  'SERVICE/UPDATE_LOG': (state, { payload }) => {
    const { log } = payload;
    return {
      ...state,
      log,
    };
  }
}, defaultState.server);


export default combineReducers({
  service: serviceReducer,
});
