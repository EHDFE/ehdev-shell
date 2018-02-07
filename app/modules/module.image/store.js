/**
 * Image Store
 * @author Hefan
 */
import crypto from 'crypto';
import { combineReducers } from 'redux';
import { createActions, handleActions } from 'redux-actions';

import COMMON_API from '../../apis/common';

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
    SET_LIST_TYPE: layout => layout
  },
  // files action
  GENFILES: {
    // add one file
    ADD: file => ({ file }),
    // delete one file
    DEL: async id => {
      return id;
    },
    DO_GEN: async (files, config) => {
      let fileArr = [];
      files.map(file => {
        fileArr.push(file.file);
      });
      const over = await COMMON_API.imageMin({
        fileArr,
        config
      });

      if (over.result === 'success') {
        return {
          fileMap: over.data[0],
          fileIds: []
        };
      }
    },
    CLEAR: files => ({ files })
  },
  GENERATE: {
    UP_CONFIG: config => {
      return config;
    },
    DEL: () => {}
  }
});

const layoutReducer = handleActions(
  {
    'GENLAYOUT/SET_LIST_TYPE': (state, action) => ({
      listType: action.payload
    })
  },
  defaultState.layout
);

const fileReducer = handleActions(
  {
    'GENFILES/ADD': (state, { payload }) => {
      const { file } = payload;
      if (!file._id) {
        // generate hash id with file name, file size & last modified time
        const fileId = [file.name, file.type, file.lastModified].join('/');
        const id = crypto
          .createHash('md5')
          .update(fileId)
          .digest('hex')
          .substr(0, 16);

        Object.assign(file, {
          size: file.file.size,
          _id: id,
          temp: false
        });
      }
      if (state.fileIds.includes(file._id)) {
        return state;
      }
      return {
        fileMap: {
          [file._id]: file,
          ...state.fileMap
        },
        fileIds: [file._id].concat(state.fileIds)
      };
    },
    'GENFILES/DEL': (state, { payload }) => {
      const id = payload;
      const { fileMap, fileIds } = state;
      delete fileMap[id];
      return {
        fileMap: Object.assign({}, fileMap),
        fileIds: fileIds.filter(d => d !== id)
      };
    },
    'GENFILES/CLEAR': (state, { payload }) => {
      return {
        fileMap: {},
        fileIds: []
      };
    },
    'GENFILES/DO_GEN': (state, { payload }) => {
     
      let newFileMap = {};
      let newFileIds = [];

      Object.keys(state.fileMap).map((key, index) => {
        if (state.fileMap.hasOwnProperty(key)) {
          const element = state.fileMap[key];
          newFileMap[key] = Object.assign({}, element, payload.fileMap[index]);
        }
      });

      return {
        fileMap: newFileMap,
        fileIds: newFileIds
      };
    }
  },
  defaultState.files
);

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
    'GENERATE/DEL': (state, { payload }) => {
      return {
        gConfig: {
          quality: 90,
          format: '',
          webp: false,
          output: ''
        },
        gOverList: []
      };
    }
  },
  defaultState.generate
);

export default combineReducers({
  layout: layoutReducer,
  gfiles: fileReducer,
  generate: geReducer
});
