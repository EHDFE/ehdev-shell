/**
 * Upload Store
 * @author ryan.bian
 */
import crypto from 'crypto';
import { combineReducers } from 'redux';
import { createActions, handleActions } from 'redux-actions';

import UPLOAD_API from '../../apis/upload';

const defaultState = {
  layout: {
    listType: 'grid',
  },
  files: {
    fileMap: {},
    fileIds: [],
  },
};

export const actions = createActions({
  // display layout action
  LAYOUT: {
    SET_LIST_TYPE: layout => layout,
  },
  LIST: {
    GET: async params => {
      const { content, limit, start } = await UPLOAD_API.list.get(params);
      return {
        files: content,
        limit,
        start,
      }
    },
  },
  // files action
  FILES: {
    // add one file
    ADD: file => ({ file }),
    // delete one file
    DEL: async id => {
      // TODO: no need to request when del temp file
      const res = await UPLOAD_API.list.del([id]);
      return {
        id,
        result: res,
      };
    },
    // add multiple files
    BATCH_ADD: files => ({ files }),
    // delete multiple files
    BATCH_DEL: ids => ({ ids }),
    UPLOAD: async (oldId, data) => {
      const url = await UPLOAD_API.file.put(data.file);
      const storageData = await UPLOAD_API.list.put([{
        url,
        name: data.file.name,
        type: data.file.type,
        lastModified: data.file.lastModified,
      }]);
      return {
        oldId,
        file: storageData[0],
      };
    },
  },
});

const layoutReducer = handleActions({
  'LAYOUT/SET_LIST_TYPE': (state, action) => ({
    listType: action.payload,
  })
}, defaultState.layout);

const fileReducer = handleActions({
  'LIST/GET': (state, { payload, error }) => {
    if (error) return state;
    const { files } = payload;
    const fileMap = {};
    const fileIds = [];
    files.forEach(file => {
      Object.assign(fileMap, {
        [file._id]: file,
      });
      fileIds.push(file._id);
    });
    return {
      fileMap: Object.assign({}, state.fileMap, fileMap),
      fileIds: state.fileIds.concat(fileIds),
    };
  },
  'FILES/ADD': (state, { payload }) => {
    const { file } = payload;
    if (!file._id) {
      // generate hash id with file name, file size & last modified time
      const fileId = [file.name, file.type, file.lastModified].join('/');
      const id = crypto.createHash('md5').update(fileId).digest('hex').substr(0, 16);
      Object.assign(file, {
        _id: id,
        // has not been uploaded
        temp: true,
      });
    }
    if (state.fileIds.includes(file._id)) {
      return state;
    }
    return {
      fileMap: {
        ...state.fileMap,
        [file._id]: file,
      },
      fileIds: state.fileIds.concat(file._id),
    }
  },
  'FILES/DEL': (state, { payload, error }) => {
    if (error) return state;
    const { id, result } = payload;
    const { fileMap, fileIds } = state;
    delete fileMap[id];
    return {
      fileMap: Object.assign({}, fileMap),
      fileIds: fileIds.filter(d => d !== id),
    };
  },
  'FILES/BATCH_ADD': (state, { payload }) => {
    return state;
  },
  'FILES/BATCH_DEL': (state, { payload }) => {
    return state;
  },
  'FILES/UPLOAD': (state, { payload, error }) => {
    if (error) return state;
    const idx = state.fileIds.indexOf(payload.oldId);
    const newId = payload.file._id;
    // delete old file object
    delete state.fileMap[payload.oldId];
    return {
      fileMap: Object.assign({}, state.fileMap, {
        [newId]: payload.file,
      }),
      // replace old id with newId
      fileIds: state.fileIds.slice(0).splice(idx, 1, newId),
    };
  },
}, defaultState.files);

export default combineReducers({
  layout: layoutReducer,
  files: fileReducer,
});
