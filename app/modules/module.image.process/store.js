import { Map } from 'immutable';
import { createActions, handleActions } from 'redux-actions';
import fileType from 'file-type';
import IMAGE_MIN_API from '../../apis/imagemin';

const defaultState = Map({
  originalImage: null,
  processedImage: null,
});

export const actions = createActions({
  ADD: file => file,
  MINIFY: async (input, plugin, options) => {
    return IMAGE_MIN_API.process(input, plugin, options);
  },
  MINIFY_BUFFER: async (buffer) => {
    return IMAGE_MIN_API.processBuffer(buffer);
  },
});

const imageProcessReducer = handleActions({
  ADD: (state, { payload }) => {
    return state.set('originalImage', Map({
      name: payload.name,
      path: payload.path,
      url: `file://${payload.path}`,
      size: payload.size,
      type: payload.type,
    }));
  },
  MINIFY: (state, { payload, error }) => {
    if (error || payload.length === 0) return state;
    const buffer = payload[0].data;
    const fileTypeResult = fileType(payload[0].data);
    const base64 = buffer.toString('base64');
    return state.set('processedImage', Map({
      url: `data:${fileTypeResult.mime};base64,${base64}`,
      size: payload[0].data.byteLength,
      type: fileTypeResult.mime,
      ext: fileTypeResult.ext,
      base64,
    }));
  },
  MINIFY_BUFFER: state => state,
}, defaultState);

export default imageProcessReducer;
