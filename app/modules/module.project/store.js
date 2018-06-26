
/**
 * Project Store
 * @author ryan.bian
 */
import { List, Map, Set, fromJS } from 'immutable';
import { createActions, handleActions } from 'redux-actions';
import { combineReducers } from 'redux-immutable';
import { notification } from 'antd';
import PROJECT_API from '../../apis/project';
import SERVICE_API from '../../apis/service';

const defaultState = Map({
  env: Map({
    rootPath: undefined,
    pkg: undefined,
    config: undefined,
    configRaw: '',
    pkgInfo: Map({}),
    runnable: false,
    useESlint: false,
    lintResult: List([]),
    runtimeConfig: Map({
      port: 3000,
      https: false,
      noInfo: true,
      analyzer: false,
    }),
  }),
  service: Map({
    pids: Set([]),
    instances: Map({}),
  }),
});

export const actions = createActions({
  ENV: {
    SET_ROOT_PATH: async rootPath => {
      try {
        await PROJECT_API.root.makeRecord(rootPath);
      } catch (e) {
        notification.error({
          message: 'Error',
          description: e.toString(),
        });
      }
      return rootPath;
    },
    GET_ENV: async rootPath => await PROJECT_API.root.post(rootPath),
    SAVE_CONFIG: async (rootPath, content) => {
      try {
        await PROJECT_API.root.saveConfig({
          rootPath,
          content,
        });
        return {
          rootPath,
          content,
        };
      } catch (e) {
        throw Error(e);
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
      const { projectName } = params;
      const { pid } = await SERVICE_API.server.start(params);
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
  'ENV/SET_ROOT_PATH': (state, { payload, error }) => {
    if (error) return state;
    return state
      .set('rootPath', payload);
  },
  'ENV/GET_ENV': (state, { payload, error }) => {
    if (error) return state;
    return state.merge(fromJS(payload));
  },
  'ENV/SAVE_CONFIG': (state, { payload, error }) => {
    if (error) return state;
    const { content } = payload;
    return state.set('configRaw', content).set('config', JSON.parse(content));
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
        Map({}),
        map => map.withMutations(map => map.set('running', isRunning))
      );
  },
}, defaultState.get('service'));

export default combineReducers({
  env: envReducer,
  service: serviceReducer,
});
