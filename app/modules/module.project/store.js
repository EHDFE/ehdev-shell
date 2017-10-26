/**
 * Project Store
 * @author ryan.bian
 */
import { combineReducers } from 'redux';
import { createActions, handleActions } from 'redux-actions';
import { ipcRenderer } from 'electron';

import PROJECT_API from '../../apis/project';
import SERVICE_API from '../../apis/service';

const defaultState = {
  env: {
    rootPath: undefined,
    pkg: undefined,
    config: {},
    test:{}
  },
  service: {
    pid: null,
    log: '',
  },
};

const COMMAND_OUTPUT = 'COMMAND_OUTPUT';

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
    SET_ENV: async (configs) =>{
      await PROJECT_API.root.set(configs);
    },
    GET_OUTDATED: async packageName => {
      const data = await PROJECT_API.pkg.outdated(packageName);
      return {
        test:data
      };
    },
  },
  SERVICE: {
    UPDATE_LOG: log => {
      return {
        log,
      };
    },
    START_SERVER: async (params, dispatch) => {
      const { pid } = await SERVICE_API.server.start(params);
      ipcRenderer.on(COMMAND_OUTPUT, (event, arg) => {
        if (arg.action === 'log' || arg.action === 'error') {
          dispatch(actions.service.updateLog(arg.data));
        } else if (arg.action === 'exit') {
          dispatch(actions.service.stopServer(pid, true));
        }
      });
      return {
        pid,
      };
    },
    STOP_SERVER: async (pid, stopped) => {
      if (!stopped) {
        await SERVICE_API.server.stop(pid);
      } else {
        return {};
      }
      ipcRenderer.on(COMMAND_OUTPUT, (event, arg) => {
        ipcRenderer.removeAllListeners([listener]);
      });
    },
    // START_BUILD: async params => await SERVICE_API.builder.start(),
    // STOP_BUILD: async params => await SERVICE_API.builder.stop(),
  },
});

/**
 * project's running environment
 */
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
  },
  'ENV/SET_ENV': (state, { payload, error }) => {
    if (error) return state;
    return {
      ...state,
      ...payload,
    };
  },
  'ENV/GET_OUTDATED': (state, { payload, error }) => {
    if (error) return state;
    return {
      ...state,
      ...payload,
    };
  }
}, defaultState.env);

/**
 * project's runner reducer
 */
const serviceReducer = handleActions({
  'SERVICE/UPDATE_LOG': (state, { payload }) => {
    const { log } = payload;
    return {
      ...state,
      log,
    };
  },
  'SERVICE/START_SERVER': (state, { payload, error }) => {
    if (error) return state;
    const { pid } = payload;
    return {
      ...state,
      pid,
    };
  },
  'SERVICE/STOP_SERVER': (state, { error }) => {
    if (error) return state;
    return {
      ...state,
      pid: null,
    };
  },
}, defaultState.service);

export default combineReducers({
  env: envReducer,
  service: serviceReducer,
});
