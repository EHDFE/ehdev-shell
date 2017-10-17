/**
 * Project Store
 * @author ryan.bian
 */
import { combineReducers } from 'redux';
import { createActions, handleActions } from 'redux-actions';

import PROJECT_API from '../../apis/project';

const defaultState = {
  env: {
    rootPath: undefined,
    pkg: undefined,
    config: {},
  },
};

export const actions = createActions({
  ENV: {
    SET_ROOT_PATH: rootPath => rootPath,
    GET_ENV: async rootPath => {
      const { pkg, config } = await PROJECT_API.root.put(rootPath);
      return {
        pkg,
        config,
      };
    },
  },
});

const envReducer = handleActions({
  'ENV/SET_ROOT_PATH': (state, { payload }) => ({
    ...state,
    rootPath: payload,
  }),
  'ENV/GET_ENV': (state, { payload, error }) => {
    if (error) return state;
    return {
      ...state,
      ...payload,
    };
  }
}, defaultState.env);

export default combineReducers({
  env: envReducer,
});
