/**
 * Configer Store
 * @author ryan.bian
 */
import { ipcRenderer } from 'electron';
import { Map, Set, fromJS } from 'immutable';
import { createActions, handleActions } from 'redux-actions';
import { combineReducers } from 'redux-immutable';
import CONFIGER_API from '../../apis/configer';

const defaultState = Map({
  remote: Map({
    configMap: Map({}),
    configIds: Set([]),
  }),
  local: Map({
    configMap: Map({}),
    configIds: Set([]),
  }),
  progress: Map({
    pending: false,
  }),
});

export const actions = createActions({
  GET_CONFIGS: async () => await CONFIGER_API.get(),
  GET_REMOTE_CONFIGS: async () => await CONFIGER_API.getConfigsFromNpm(),
  ADD: async (name, dispatch) => {
    try {
      const { installPid } = await CONFIGER_API.add(name);
      dispatch(actions.setPending(true));
      ipcRenderer.once(`COMMAND_EXIT:${installPid}`, () => {
        dispatch(actions.setPending(false));
        dispatch(actions.getConfigs());
      });
      return { pid: installPid };
    } catch (e) {
      throw Error(e);
    }
  },
  UPLOAD: async () => await CONFIGER_API.upload(),
  REMOVE: async (name, dispatch) => {
    try {
      const { removePid } = await CONFIGER_API.remove(name);
      dispatch(actions.setPending(true));
      ipcRenderer.once(`COMMAND_EXIT:${removePid}`, () => {
        dispatch(actions.setPending(false));
        dispatch(actions.getConfigs());
      });
      return { pid: removePid };
    } catch (e) {
      throw Error(e);
    }
  },
  UPGRADE: async (name, version, dispatch) => {
    try {
      const { upgradePid } = await CONFIGER_API.upgrade(name, version);
      dispatch(actions.setPending(true));
      ipcRenderer.once(`COMMAND_EXIT:${upgradePid}`, () => {
        dispatch(actions.setPending(false));
        dispatch(actions.getConfigs());
      });
      return { pid: upgradePid };
    } catch (e) {
      throw Error(e);
    }
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

const localConfigerReducer = handleActions(
  {
    GET_CONFIGS: (state, { payload }) => {
      const maps = {};
      payload.forEach(d => {
        maps[d.name] = d;
      });
      return state
        .set('configIds', Set(payload.map(d => d.name)))
        .set('configMap', fromJS(maps));
    },
    ADD: state => {
      return state;
    },
    UPLOAD: state => {
      return state;
    },
    REMOVE: state => {
      return state;
    },
    UPGRADE: state => {
      return state;
    },
    GET_PKG_VERSIONS: (state, { payload }) => {
      const { versions, name } = payload;
      return state.setIn(['configMap', name, 'versions'], fromJS(versions));
    },
  },
  defaultState.get('local'),
);

const remoteConfigerReducer = handleActions(
  {
    GET_REMOTE_CONFIGS: (state, { payload }) => {
      const maps = {};
      const validConfigs = Array.isArray(payload)
        ? payload.filter(d => d.name.startsWith('ehdev-configer-'))
        : [];
      validConfigs.forEach(d => {
        maps[d.name] = d;
      });
      return state
        .set('configIds', Set(validConfigs.map(d => d.name)))
        .set('configMap', fromJS(maps));
    },
  },
  defaultState.get('remote'),
);

const progressReducer = handleActions(
  {
    SET_PENDING: (state, { payload }) => {
      return state.set('pending', payload);
    },
  },
  defaultState.get('progress'),
);

export default combineReducers({
  remote: remoteConfigerReducer,
  local: localConfigerReducer,
  progress: progressReducer,
});
