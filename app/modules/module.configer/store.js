/**
 * Configer Store
 * @author ryan.bian
 */
import { combineReducers } from 'redux';
import { createActions, handleActions } from 'redux-actions';
import { ipcRenderer } from 'electron';

import CONFIGER_API from '../../apis/configer';

const COMMAND_OUTPUT = 'COMMAND_OUTPUT';

const defaultState = {
  remote: {
    configMap: {},
    configIds: [],
  },
  local: {
    configMap: {},
    configIds: [],
  },
  progress: {
    pending: false,
  },
};

export const actions = createActions({
  GET_CONFIGS: async () => await CONFIGER_API.get(),
  GET_REMOTE_CONFIGS: async () => await CONFIGER_API.getConfigsFromNpm(),
  ADD: async (name, dispatch) => {
    await CONFIGER_API.add(name);
    const listener = (event, arg) => {
      if (arg.action === 'exit' || arg.action === 'error') {
        dispatch(actions.setPending(false));
        dispatch(actions.getConfigs());
        ipcRenderer.removeListener(COMMAND_OUTPUT, listener);
      }
    };
    ipcRenderer.on(COMMAND_OUTPUT, listener);
    dispatch(actions.setPending(true));
  },
  UPLOAD: async () => await CONFIGER_API.upload(),
  REMOVE: async (name, dispatch) => {
    await CONFIGER_API.remove(name);
    const listener = (event, arg) => {
      if (arg.action === 'exit' || arg.action === 'error') {
        dispatch(actions.setPending(false));
        dispatch(actions.getConfigs());
        ipcRenderer.removeListener(COMMAND_OUTPUT, listener);
      }
    };
    ipcRenderer.on(COMMAND_OUTPUT, listener);
    dispatch(actions.setPending(true));
  },
  UPGRADE: async (name, version, dispatch) => {
    await CONFIGER_API.upgrade(name, version);
    const listener = (event, arg) => {
      if (arg.action === 'exit' || arg.action === 'error') {
        dispatch(actions.setPending(false));
        dispatch(actions.getConfigs());
        ipcRenderer.removeListener(COMMAND_OUTPUT, listener);
      }
    };
    ipcRenderer.on(COMMAND_OUTPUT, listener);
    dispatch(actions.setPending(true));
  },
  SET_PENDING: pending => pending,
  GET_PKG_VERSIONS: async name => {
    const versions = await CONFIGER_API.getVersions(name);
    return {
      versions,
      name,
    };
  },
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
  GET_PKG_VERSIONS: (state, { payload }) => {
    const { versions, name } = payload;
    return {
      configIds: state.configIds,
      configMap: {
        ...state.configMap,
        [name]: {
          ...state.configMap[name],
          versions,
        },
      },
    };
  },
}, defaultState.local);

const remoteConfigerReducer = handleActions({
  GET_REMOTE_CONFIGS: (state, { payload }) => {
    const maps = {};
    const validConfigs = payload.filter(d => d.name.startsWith('ehdev-configer-'));
    validConfigs.forEach(d => {
      maps[d.name] = d;
    });
    return {
      configIds: validConfigs.map(d => d.name),
      configMap: maps,
    };
  },
}, defaultState.remote);

const progressReducer = handleActions({
  SET_PENDING: (state, { payload }) => {
    return {
      pending: payload,
    };
  },
}, defaultState.progress);

export default combineReducers({
  remote: remoteConfigerReducer,
  local: localConfigerReducer,
  progress: progressReducer,
});
