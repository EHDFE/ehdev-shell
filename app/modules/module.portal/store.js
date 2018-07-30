/**
 * Portal Store
 * @author ryan.bian
 */
import { Map } from 'immutable';
import { createActions, handleActions } from 'redux-actions';
import PORTAL_API from '../../apis/portal';
import COMMON_API from '../../apis/common';
import fileManager from '../../service/fileManager/';

const defaultState = Map({
  running: false,
  host: undefined,
  files: Map(),
});

export const actions = createActions({
  async INIT_PORTAL() {
    const fileList = PORTAL_API.getPool();
    const state = PORTAL_API.getState();
    try {
      const fileEntityList = await fileManager.resolveFiles(fileList.map(d => d[1]));
      const fileMap = {};
      fileList.forEach((group, i) => {
        Object.assign(fileMap, {
          [group[0]]: Map({
            file: fileEntityList[i],
          }),
        });
      });
      return {
        state,
        fileMap,
      };
    } catch (e) {
      throw e;
    }
  },
  async ADD_PORTAL(fileList) {
    try {
      const ids = await PORTAL_API.open(fileList.map(f => f.path));
      return {
        ids,
        fileList,
      };
    } catch (e) {
      throw e;
    }
  },
  async REMOVE_PORTAL(id) {
    try {
      await PORTAL_API.close(id);
      return {
        id,
      };
    } catch (e) {
      throw e;
    }
  },
  async START_SERVER() {
    return await PORTAL_API.start();
  },
  async STOP_SERVER() {
    return await PORTAL_API.stop();
  },
  async GENERATE_QRCODE(urlMap) {
    const result = {};
    try {
      for (const [id, url] of Object.entries(urlMap)) {
        const qrCode = await COMMON_API.getQrCode(url);
        Object.assign(result, {
          [id]: qrCode.url,
        });
      }
      return result;
    } catch (e) {
      throw e;
    }
  },
});

const reducer = handleActions({
  INIT_PORTAL(originState, { error, payload }) {
    if (error) return state;
    const { fileMap, state } = payload;
    return originState
      .set('host', state.host)
      .set('running', state.running)
      .mergeDeepIn(['files'], fileMap);
  },
  ADD_PORTAL(state, { payload, error }) {
    if (error) return state;
    const { ids, fileList } = payload;
    const incrementFiles = {};
    fileList.forEach((file, idx) => {
      Object.assign(incrementFiles, {
        [ids[idx]]: Map({
          file,
        }),
      });
    });
    return state.mergeDeepIn(['files'], incrementFiles);
  },
  REMOVE_PORTAL(state, { payload, error }) {
    if (error) return state;
    const { id } = payload;
    return state.deleteIn(['files', id]);
  },
  START_SERVER(state, { payload, error }) {
    if (error) return state;
    return state
      .set('running', true)
      .set('host', payload);
  },
  STOP_SERVER(state, { payload, error }) {
    if (error) return state;
    return state
      .set('running', false)
      .set('host', undefined);
  },
  GENERATE_QRCODE(state, { payload, error }) {
    if (error) return state;
    return state.update('files', files => {
      return files.withMutations(map => {
        Object.keys(payload).forEach(id => {
          map.setIn([id, 'qrcode'], payload[id]);
        });
      });
    });
  },
}, defaultState);

export default reducer;
