
/**
 * Project Store
 * @author ryan.bian
 */
import { combineReducers } from 'redux';
import { createActions, handleActions } from 'redux-actions';
import { ipcRenderer } from 'electron';

import PROJECT_API from '../../apis/project';
import SERVICE_API from '../../apis/service';
// import COMMON_API from '../../apis/common';

import showNotification from '../../utils/notification';

const defaultState = {
  env: {
    rootPath: undefined,
    pkg: undefined,
    config: undefined,
    pkgInfo: {},
    runnable: false,
    useESlint: false,
    lintResult: [],
    prevRootPath: undefined,
    runtimeConfig: {
      port: 3000,
    },
  },
  service: {
    pids: [],
    instances: {},
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
      const { pkg, config, runnable, useESlint } = await PROJECT_API.root.post(rootPath);
      return {
        pkg,
        config,
        runnable,
        useESlint,
      };
    },
    SET_ENV: async (configs, rootPath, dispatch) => {
      try {
        await PROJECT_API.root.editConfig(configs);
        dispatch(actions.env.getEnv(rootPath));
        return {};
      } catch (e) {
        throw new Error(e);
      }
    },
    UPDATE_RUNTIME_CONFIG: config => config,
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
    // GET_LINT_RESULT: async rootPath => {
    //   return await COMMON_API.getESlintResult(rootPath);
    // },
  },
  SERVICE: {
    START_SERVER: async (params, dispatch) => {
      const { pid } = await SERVICE_API.server.start(params);
      const startListener = function (dispatch, event, arg) {
        if (arg.action === 'exit' || arg.action === 'error') {
          dispatch(actions.service.stopServer(arg.pid, true, params));
          ipcRenderer.removeListener(COMMAND_OUTPUT, startListener);
        }
      }.bind(this, dispatch);
      ipcRenderer.on(COMMAND_OUTPUT, startListener);
      showNotification('启动开发环境', {
        body: `项目名: ${params.projectName}\n端口: ${params.port}\n进程PID: ${pid}`,
      });
      return {
        pid,
        rootPath: params.root,
        type: 'server',
      };
    },
    STOP_SERVER: async (pid, stopped, params) => {
      if (!stopped) {
        try {
          await SERVICE_API.server.stop(pid);
          return { pid };
        } catch (e) {
          throw e;
        }
      }
      showNotification('停止开发环境', {
        body: `项目名: ${params.projectName}\n进程PID: ${pid}`
      });
      return { pid };
    },
    START_BUILDER: async (params, dispatch) => {
      const { pid } = await SERVICE_API.builder.start(params);
      const startListener = function (dispatch, event, arg) {
        if (arg.action === 'exit' || arg.action === 'error') {
          dispatch(actions.service.stopBuilder(arg.pid, true, params));
          ipcRenderer.removeListener(COMMAND_OUTPUT, startListener);
        }
      }.bind(this, dispatch);
      ipcRenderer.on(COMMAND_OUTPUT, startListener);
      showNotification('开始构建', {
        body: `项目名: ${params.projectName}\n进程PID: ${pid}`,
      });
      return {
        pid,
        rootPath: params.root,
        type: 'builder',
      };
    },
    STOP_BUILDER: async (pid, stopped, params) => {
      if (!stopped) {
        try {
          await SERVICE_API.builder.stop(pid);
          return {
            pid,
          };
        } catch (e) {
          throw e;
        }
      }
      showNotification('构建已停止', {
        body: `项目名: ${params.projectName}\n进程PID: ${pid}`
      });
      return { pid };
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
    prevRootPath: state.rootPath,
    lintResult: [],
    runtimeConfig: { ...defaultState.env.runtimeConfig },
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
  'ENV/UPDATE_RUNTIME_CONFIG': (state, { payload }) => {
    return {
      ...state,
      runtimeConfig: Object.assign({}, state.runtimeConfig, payload),
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
  },
  'ENV/GET_LINT_RESULT': (state, { payload, error }) => {
    if (error) return state;
    return {
      ...state,
      lintResult: payload,
    };
  }
}, defaultState.env);

/**
 * project's runner reducer
 */
const serviceReducer = handleActions({
  'SERVICE/START_SERVER': (state, { payload, error }) => {
    if (error) return state;
    const { pid, rootPath, type } = payload;
    const pids = state.pids || [];
    const instances = state.instances || {};
    if (pids && pids.includes(pid)) return state;
    return {
      pids: pids.concat(pid),
      instances: {
        ...instances,
        [pid]: {
          pid,
          type,
          rootPath,
        },
      }
    };
  },
  'SERVICE/STOP_SERVER': (state, { payload, error }) => {
    if (error) return state;
    const instances = Object.assign({}, state.instances);
    const pids = state.pids || [];
    delete instances[payload.pid];
    return {
      pids: pids.filter(id => id !== payload.pid),
      instances,
    };
  },
  'SERVICE/START_BUILDER': (state, { payload, error }) => {
    if (error) return state;
    const { pid, rootPath, type } = payload;
    const pids = state.pids || [];
    const instances = state.instances || {};
    if (pids.includes(pid)) return state;
    return {
      pids: pids.concat(pid),
      instances: {
        ...instances,
        [pid]: {
          pid,
          type,
          rootPath,
        },
      }
    };
  },
  'SERVICE/STOP_BUILDER': (state, { payload, error }) => {
    if (error) return state;
    const instances = Object.assign({}, state.instances);
    const pids = state.pids || [];
    delete instances[payload.pid];
    return {
      pids: pids.filter(id => id !== payload.pid),
      instances,
    };
  },
}, defaultState.service);

export default combineReducers({
  env: envReducer,
  service: serviceReducer,
});
