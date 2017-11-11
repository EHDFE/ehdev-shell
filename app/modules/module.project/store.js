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
    pkgInfo: {}
  },
  service: {
    runningService: null,
    pid: null,
  },
};

const COMMAND_OUTPUT = 'COMMAND_OUTPUT';

export const actions = createActions({
  ENV: {
    SET_ROOT_PATH: rootPath => {
      PROJECT_API.root.makeRecord(rootPath);
      return rootPath;
    },
    GET_ENV: async rootPath => {
      const { pkg, config } = await PROJECT_API.root.post(rootPath);
      return {
        pkg,
        config,
      };
    },
    SET_ENV: async (configs) =>{
      await PROJECT_API.root.editConfig(configs);
    },
    GET_OUTDATED: async packageName => {
      const data = await PROJECT_API.pkg.outdated(packageName);
      return {
        packages: data
      };
    },
    GET_PKGINFO: async rootPath => {
      const data = await PROJECT_API.pkg.getAllVersions(rootPath);
      return {
        pkgInfo: data
      };
    },
  },
  SERVICE: {
    START_SERVER: async (params, dispatch) => {
      const { pid } = await SERVICE_API.server.start(params);
      const startListener = function (dispatch, event, arg) {
        if (arg.action === 'exit' || arg.action === 'error') {
          dispatch(actions.service.stopServer(pid, true));
          ipcRenderer.removeListener(COMMAND_OUTPUT, startListener);
        }
      }.bind(this, dispatch);
      ipcRenderer.on(COMMAND_OUTPUT, startListener);
      return {
        runningService: 'server',
        pid,
      };
    },
    STOP_SERVER: async (pid, stopped) => {
      if (!stopped) {
        await SERVICE_API.server.stop(pid);
      } else {
        return {};
      }
    },
    START_BUILDER: async (params, dispatch) => {
      const { pid } = await SERVICE_API.builder.start(params);
      const startListener = function (dispatch, event, arg) {
        if (arg.action === 'exit' || arg.action === 'error') {
          dispatch(actions.service.stopBuilder(pid, true));
          ipcRenderer.removeListener(COMMAND_OUTPUT, startListener);
        }
      }.bind(this, dispatch);
      ipcRenderer.on(COMMAND_OUTPUT, startListener);
      return {
        runningService: 'builder',
        pid,
      };
    },
    STOP_BUILDER: async (pid, stopped) => {
      if (!stopped) {
        await SERVICE_API.builder.stop(pid);
      } else {
        return {};
      }
    }
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
  },
  'ENV/GET_PKGINFO': (state, { payload, error }) => {
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
  'SERVICE/START_SERVER': (state, { payload, error }) => {
    if (error) return state;
    const { pid, runningService } = payload;
    return {
      runningService,
      pid,
    };
  },
  'SERVICE/STOP_SERVER': (state, { error }) => {
    if (error) return state;
    return {
      runningService: null,
      pid: null,
    };
  },
  'SERVICE/START_BUILDER': (state, { payload, error }) => {
    if (error) return state;
    const { pid, runningService } = payload;
    return {
      runningService,
      pid,
    };
  },
  'SERVICE/STOP_BUILDER': (state, { error }) => {
    if (error) return state;
    return {
      runningService: null,
      pid: null,
    };
  },
}, defaultState.service);

export default combineReducers({
  env: envReducer,
  service: serviceReducer,
});
