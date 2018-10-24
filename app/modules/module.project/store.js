/**
 * Project Store
 * @author ryan.bian
 */
import { Map, fromJS } from 'immutable';
import { createActions, handleActions } from 'redux-actions';
import { notification } from 'antd';
import PROJECT_API from '../../apis/project';
import SERVICE_API from '../../apis/service';

const defaultEnvState = Map({
  rootPath: undefined,
  pkg: undefined,
  config: undefined,
  runnable: false,
  runtimeConfig: Map({
    port: 3000,
    https: false,
    noInfo: true,
    analyzer: false,
  }),
});

const defaultServiceState = Map({
  instances: Map({}),
  serviceRootPath: undefined,
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
    UPDATE_RUNTIME_CONFIG: config => config,
  },
  SERVICE: {
    START: async (serviceType, params) => {
      const { projectName, root } = params;
      const { ppid } = await SERVICE_API[serviceType].start(params);
      return {
        ppid,
        rootPath: root,
        type: serviceType,
        projectName,
      };
    },
    STOP: async (serviceType, params) => {
      const { ppid, root } = params;
      await SERVICE_API[serviceType].stop(ppid);
      return {
        ppid,
        rootPath: root,
      };
    },
    CLOSE_PROJECT: async (rootPath, ppid) => {
      await SERVICE_API.closePty(ppid);
      return {
        ppid,
        rootPath,
      };
    },
  },
});

/**
 * project's running environment
 */
export const envReducer = handleActions(
  {
    'ENV/SET_ROOT_PATH': (state, { payload, error }) => {
      if (error) return state;
      return state.set('rootPath', payload);
    },
    'ENV/GET_ENV': (state, { payload, error }) => {
      if (error) return state;
      return state.merge(fromJS(payload));
    },
    'ENV/UPDATE_RUNTIME_CONFIG': (state, { payload }) => {
      return state.mergeIn(['runtimeConfig'], fromJS(payload));
    },
  },
  defaultEnvState,
);

/**
 * project's runner reducer
 */
export const serviceReducer = handleActions(
  {
    'SERVICE/START': (state, { payload, error }) => {
      if (error) return state;
      const { ppid, rootPath, type, projectName } = payload;
      if (state.hasIn(['instances', rootPath])) {
        return state.updateIn(['instances', rootPath], map => {
          return map.set('running', true).set('type', type);
        });
      }
      return state
        .setIn(
          ['instances', rootPath],
          Map({
            ppid,
            type,
            projectName,
            rootPath,
            running: true,
          }),
        )
        .set('serviceRootPath', rootPath);
    },
    'SERVICE/STOP': (state, { payload, error }) => {
      if (error) return state;
      const { rootPath } = payload;
      return state
        .updateIn(['instances', rootPath], map => {
          return map.set('running', false).set('type', null);
        })
        .set('serviceRootPath', rootPath);
    },
    'SERVICE/CLOSE_PROJECT': (state, { payload }) => {
      const { rootPath } = payload;
      return state.deleteIn(['instances', rootPath]);
    },
  },
  defaultServiceState,
);
