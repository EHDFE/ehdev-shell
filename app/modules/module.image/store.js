/**
 * Image Store
 * @author Hefan
 */
import crypto from 'crypto';
import { combineReducers } from 'redux';
import { createActions, handleActions } from 'redux-actions';

import UPLOAD_API from '../../apis/upload';

const defaultState = {
  layout: {
    listType: 'list'
  },
  files: {
    fileMap: {},
    fileIds: []
  },
  generate: {
    gConfig: {
      quality: 90,
      format: '',
      webp: false,
      output: ''
    },
    gOverList: []
  }
};

export const actions = createActions({
  // display layout action
  GENLAYOUT: {
    SET_LIST_TYPE: layout => layout,
  },
  GENLIST: {
    GET: async params => {

      return {
        files: null,
        limit: null,
        start: null,
      };
    },
  },
  // files action
  GENFILES: {
    // add one file
    ADD: file => ({ file }),
    // delete one file
    DEL: async id => {

      return id;
    },
    // add multiple files
    BATCH_ADD: files => ({ files }),
    // delete multiple files
    BATCH_DEL: ids => ({ ids }),
    DO_GEN: async (files, config) => {
      const over = await UPLOAD_API.gfile.post(files, config);

      return over;
    },
    CLEAR: files => ({ files }),
  },
  GENERATE: {
    UP_CONFIG: (config) => {
      return config;
    },
    UP_OVER_LIST: (list) => {
      return list;
    },
    DO_GEN: async (files, config) => {
      const over = await UPLOAD_API.gfile.post(files, config);

      return over;
    },
    DEL: () => {},
  }
});

const layoutReducer = handleActions({
  'GENLAYOUT/SET_LIST_TYPE': (state, action) => ({
    listType: action.payload,
  })
}, defaultState.layout);

const fileReducer = handleActions({
  'GENLIST/GET': (state, { payload }) => {

    const { files } = payload;
    const fileMap = {};
    const fileIds = [];

    files.forEach(file => {
      Object.assign(fileMap, {
        [file._id]: file,
      });
      fileIds.unshift(file._id);
    });
    return {
      fileMap: Object.assign({}, state.fileMap, fileMap),
      fileIds: fileIds.concat(state.fileIds),
    };
  },
  'GENFILES/ADD': (state, { payload }) => {
    const { file } = payload;
    if (!file._id) {
      // generate hash id with file name, file size & last modified time
      const fileId = [file.name, file.type, file.lastModified].join('/');
      const id = crypto.createHash('md5').update(fileId).digest('hex').substr(0, 16);

      Object.assign(file, {
        size: file.file.size,
        _id: id,
        // has not been uploaded
        temp: false,
      });
    }
    if (state.fileIds.includes(file._id)) {
      return state;
    }
    return {
      fileMap: {
        [file._id]: file,
        ...state.fileMap,
      },
      // fileIds: state.fileIds.concat(file._id),
      fileIds: [file._id].concat(state.fileIds),
    };
  },
  'GENFILES/DEL': (state, { payload }) => {

    const id = payload;
    const { fileMap, fileIds } = state;
    delete fileMap[id];
    return {
      fileMap: Object.assign({}, fileMap),
      fileIds: fileIds.filter(d => d !== id),
    };
  },
  'GENFILES/CLEAR': (state, { payload }) => {

    return {
      fileMap: {},
      fileIds: []
    };
  },
  'GENFILES/DO_GEN': (state, { payload }) => {

    const { fileMap } = state;
    let newFileMap = {};
    let newFileIds = [];
    payload.map(nf => {
      Object.keys(fileMap).map(key => {
        if (fileMap[key].name === nf.originalName) {
          newFileMap[key] = Object.assign({}, fileMap[key], {
            csize: nf.size,
            uri: nf.uri
          });
          newFileIds.push(key);
        }
      });
    });
    return {
      fileMap: newFileMap,
      // replace old id with newId
      fileIds: newFileIds,
    };
  },
}, defaultState.files);

/**
 * 生成 reducer
 */
const geReducer = handleActions(
  {
    'GENERATE/UP_CONFIG': (state, { payload }) => {
      return {
        gConfig: Object.assign({}, state.gConfig, payload),
        gOverList: state.gOverList
      };
    },
    'GENERATE/UP_OVER_LIST': (state, { payload }) => {
      return {
        gConfig: state.gConfig,
        gOverList: [
          payload,
          ...state.gOverList,
        ]
      };
    },
    'GENERATE/DO_GEN': (state, { payload }) => {

      return {
        gConfig: state.gConfig,
        gOverList: [
          ...payload,
          ...state.gOverList,
        ]
      };
    },
    'GENERATE/DEL': (state, { payload }) => {
      // const { gOverList, gConfig } = state;

      return {
        gConfig: {
          quality: 90,
          format: '',
          webp: false,
          output: '',
        },
        gOverList: []
      };
    },
  },
  defaultState.generate
);


export default combineReducers({
  layout: layoutReducer,
  files: fileReducer,
  generate: geReducer
});
