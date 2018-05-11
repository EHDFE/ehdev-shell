
/**
 * Project Store
 * @author ryan.bian
 */
// import { ipcRenderer } from 'electron';
import { List, Map, Set, fromJS } from 'immutable';
import { createActions, handleActions } from 'redux-actions';
import { combineReducers } from 'redux-immutable';
import PROJECT_API from '../../apis/project';
import SERVICE_API from '../../apis/service';
// import COMMON_API from '../../apis/common';
import notificationManager from '../../service/notification';

const defaultState = Map({
  env: Map({
    rootPath: undefined,
    pkg: undefined,
    config: undefined,
    pkgInfo: Map({}),
    runnable: false,
    useESlint: false,
    lintResult: List([]),
    prevRootPath: undefined,
    runtimeConfig: Map({
      port: 3000,
      https: false,
      noInfo: true,
    }),
  }),
  service: Map({
    pids: Set([]),
    instances: Map({}),
  }),
});

// const COMMAND_OUTPUT = 'COMMAND_OUTPUT';

export const actions = createActions({
  ENV: {
    SET_ROOT_PATH: rootPath => {
      PROJECT_API.root.makeRecord(rootPath);
      return rootPath;
    },
    GET_ENV: async rootPath => await PROJECT_API.root.post(rootPath),
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
      return data;
    },
    GET_PKGINFO: async rootPath => {
      return await PROJECT_API.pkg.getAllVersions(rootPath);
    },
    // GET_LINT_RESULT: async rootPath => {
    //   return await COMMON_API.getESlintResult(rootPath);
    // },
  },
  SERVICE: {
    START_SERVER: async (params, dispatch) => {
      const { runtimeConfig, projectName } = params;
      const { pid, ip } = await SERVICE_API.server.start(params);
      notificationManager.send({
        title: '开发服务',
        message: '启动开发服务，点击打开页面！',
        onClick() {
          const protocol = runtimeConfig.https ? 'https://' : 'http://';
          notificationManager.openBrowser(`${protocol}${ip}:${runtimeConfig.port}`);
        },
      });
      return {
        pid,
        rootPath: params.root,
        type: 'server',
        projectName,
      };
    },
    STOP_SERVER: async (pid, stopped, params) => {
      if (!stopped) {
        try {
          await SERVICE_API.server.stop(+pid);
          notificationManager.send({
            title: '开发服务',
            message: '服务已停止！'
          });
          return {
            pid: +pid,
            ...params,
          };
        } catch (e) {
          throw e;
        }
      }
      return { pid };
    },
    START_BUILDER: async (params, dispatch) => {
      const { projectName } = params;
      const { pid } = await SERVICE_API.builder.start(params);
      notificationManager.send({
        title: '构建项目',
        message: '构建中！'
      });
      return {
        pid,
        rootPath: params.root,
        type: 'builder',
        projectName,
      };
    },
    STOP_BUILDER: async (pid, stopped, params) => {
      if (!stopped) {
        try {
          await SERVICE_API.builder.stop(+pid);
          notificationManager.send({
            title: '构建项目',
            message: '构建已停止！',
            onClick() {
            },
          });
          return {
            pid: +pid,
            ...params,
          };
        } catch (e) {
          throw e;
        }
      }
      return { pid };
    },
    CLOSE_SERVICE: rootPath => rootPath,
    UPDATE_STATUS: (isRunning, pid, rootPath) => ({
      isRunning,
      pid,
      rootPath,
    })
  },
});

/**
 * project's running environment
 */
const envReducer = handleActions({
  'ENV/SET_ROOT_PATH': (state, { payload }) => {
    return state
      .set('rootPath', payload)
      .set('prevRootPath', state.get('rootPath'));
  },
  'ENV/GET_ENV': (state, { payload, error }) => {
    if (error) return state;
    return state.merge(fromJS(payload));
  },
  'ENV/SET_ENV': (state, { error }) => {
    if (error) return state;
    return state;
  },
  'ENV/UPDATE_RUNTIME_CONFIG': (state, { payload }) => {
    return state.mergeIn(['runtimeConfig'], fromJS(payload));
  },
  'ENV/GET_OUTDATED': (state, { payload, error }) => {
    if (error) return state;
    return state.set('packages', fromJS(payload));
  },
  'ENV/GET_PKGINFO': (state, { payload, error }) => {
    if (error) return state;
    return state.set('pkgInfo', fromJS(payload));
  },
  'ENV/GET_LINT_RESULT': (state, { payload, error }) => {
    if (error) return state;
    return state.mergeIn(['lintResult'], fromJS(payload));
  }
}, defaultState.get('env'));

/**
 * project's runner reducer
 */
const serviceReducer = handleActions({

  'SERVICE/START_SERVER': (state, { payload, error }) => {
    if (error) return state;
    const { pid, rootPath, type, projectName } = payload;
    if (state.hasIn(['pids', pid])) return state;
    return state
      .update('pids', set => set.add(pid))
      .mergeIn(['instances', rootPath], Map({
        pid,
        type,
        rootPath,
        projectName,
        running: true,
      }));
  },
  'SERVICE/STOP_SERVER': (state, { payload, error }) => {
    if (error) return state;
    const { pid, rootPath } = payload;
    return state
      .update('pids', set => set.remove(pid))
      .updateIn(['instances', rootPath], map => map.withMutations(map => map.delete('pid').set('running', false)));
  },
  'SERVICE/START_BUILDER': (state, { payload, error }) => {
    if (error) return state;
    const { pid, rootPath, type, projectName } = payload;
    if (state.hasIn(['pids', pid])) return state;
    return state
      .update('pids', set => set.add(pid))
      .mergeIn(['instances', rootPath], Map({
        pid,
        type,
        rootPath,
        projectName,
        running: true,
      }));
  },
  'SERVICE/STOP_BUILDER': (state, { payload, error }) => {
    if (error) return state;
    const { pid, rootPath } = payload;
    return state
      .update('pids', set => set.remove(pid))
      .updateIn(['instances', rootPath], map => map.withMutations(map => map.delete('pid').set('running', false)));
  },
  'SERVICE/CLOSE_SERVICE': (state, { payload }) => {
    return state.deleteIn(['instances', payload]);
  },
  'SERVICE/UPDATE_STATUS': (state, { payload }) => {
    const { isRunning, pid, rootPath } = payload;
    let nextState;
    if (!isRunning) {
      nextState = state.update('pids', set => set.remove(pid));
    }
    return nextState
      .updateIn(
        ['instances', rootPath],
        map => map.withMutations(map => map.set('running', isRunning))
      );
  },
}, defaultState.get('service'));

export default combineReducers({
  env: envReducer,
  service: serviceReducer,
});
