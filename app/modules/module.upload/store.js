/**
 * Upload Store
 * @author ryan.bian
 */
import crypto from 'crypto';
import { combineReducers } from 'redux-immutable';
import { createActions, handleActions } from 'redux-actions';
import { Map, Set } from 'immutable';
import { notification } from 'antd';

import UPLOAD_API from '../../apis/upload';

const defaultState = Map({
  layout: Map({
    listType: 'grid',
  }),
  files: Map({
    fileMap: Map({}),
    fileIds: Set([]),
  }),
});

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
      };
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
      const response = await UPLOAD_API.file.post(data.file);
      if (response.success) {
        const storageData = await UPLOAD_API.list.post([{
          url: response.data,
          name: data.file.name,
          type: data.file.type,
          lastModified: data.file.lastModified,
        }]);
        return {
          oldId,
          file: storageData[0],
        };
      } else {
        notification.error({
          message: '上传失败',
          description: response.data,
        });
        return null;
      }
    },
  },
});

const layoutReducer = handleActions({
  'LAYOUT/SET_LIST_TYPE': (state, { payload }) => state.set('listType', payload)
}, defaultState.get('layout'));

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
    return state
      .mergeIn(['fileMap'], fileMap)
      .updateIn(['fileIds'], list => Set(fileIds).concat(list));
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
    if (state.hasIn(['fileIds', file._id])) return state;
    return state
      .mergeIn(['fileMap'], {
        [file._id]: file,
      })
      .updateIn(['fileIds'], list => Set([file._id]).concat(list));
  },
  'FILES/DEL': (state, { payload, error }) => {
    if (error) return state;
    const { id } = payload;
    return state.deleteIn(['fileMap', id])
      .deleteIn(['fileIds', id]);
  },
  'FILES/BATCH_ADD': (state, { payload }) => {
    return state;
  },
  'FILES/BATCH_DEL': (state, { payload }) => {
    return state;
  },
  'FILES/UPLOAD': (state, { payload, error }) => {
    if (error || !payload) return state;
    const newId = payload.file._id;
    return state
      .mergeIn(['fileMap'], {
        [newId]: payload.file,
      })
      .deleteIn(['fileMap', payload.oldId])
      .deleteIn(['fileIds', payload.oldId])
      .updateIn(['fileIds'], list => list.add(newId));
  },
}, defaultState.get('files'));

export default combineReducers({
  layout: layoutReducer,
  files: fileReducer,
});
