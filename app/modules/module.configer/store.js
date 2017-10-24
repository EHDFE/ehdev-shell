/**
 * Configer Store
 * @author ryan.bian
 */
import { combineReducers } from 'redux';
import { createActions, handleActions } from 'redux-actions';

import CONFIGER_API from '../../apis/configer';

const defaultState = {
  remote: {
    configMap: {},
    configIds: [],
  },
  local: {
    configMap: {},
    configIds: [],
  },
};

export const actions = createActions({
  GET_CONFIGS: async () => await CONFIGER_API.get(),
  GET_REMOTE_CONFIGS: async () => await CONFIGER_API.getConfigsFromNpm(),
  ADD: async name => await CONFIGER_API.add(name),
  UPLOAD: async () => await CONFIGER_API.upload(),
  REMOVE: async name => await CONFIGER_API.remove(name),
  UPGRADE: async name => await CONFIGER_API.upgrade(name),
});

const localConfigerReducer = handleActions({
  GET_CONFIGS: (state, { payload }) => {
    const maps = {};
    payload.forEach(d => {
      maps[d.name] = d;
    });
    return {
      configIds: payload.map(d => d.name),
      configMap: maps,
    };
  },
  ADD: (state, { payload }) => {
    return state;
  },
  UPLOAD: (state, { payload }) => {
    return state;
  },
  REMOVE: (state, { payload }) => {
    return state;
  },
  UPGRADE: (state, { payload }) => {
    return state;
  },
}, defaultState.local);

const remoteConfigerReducer = handleActions({
  GET_REMOTE_CONFIGS: (state, { payload }) => {
    const maps = {};
    payload.forEach(d => {
      maps[d.name] = d;
    });
    return {
      configIds: payload.map(d => d.name),
      configMap: maps,
    };
  },
}, defaultState.remote);

export default combineReducers({
  remote: remoteConfigerReducer,
  local: localConfigerReducer,
});
