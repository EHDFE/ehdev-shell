import { Map } from 'immutable';
import { createActions, handleActions } from 'redux-actions';
import fileType from 'file-type';
import isSvg from 'is-svg';
import IMAGE_MIN_API from '../../apis/imagemin';

const defaultState = Map({
  originalImage: Map({}),
  processedImage: Map({}),
});

export const actions = createActions({
  ADD: file => file,
  REMOVE: () => ({}),
  MINIFY: async (input, plugin, options) => {
    return IMAGE_MIN_API.process(input, plugin, options);
  },
  MINIFY_BUFFER: async (buffer) => {
    return IMAGE_MIN_API.processBuffer(buffer);
  },
});

const imageProcessReducer = handleActions({
  ADD: (state, { payload }) => {
    return state
      .set('originalImage', Map({
        name: payload.name,
        path: payload.path,
        url: `file://${payload.path}`,
        size: payload.size,
        type: payload.type,
      }))
      .update('processedImage', map => map.clear());
  },
  REMOVE: (state) => {
    return state
      .update('originalImage', map => map.clear())
      .update('processedImage', map => map.clear());
  },
  MINIFY: (state, { payload, error }) => {
    if (error) return state;
    const buffer = payload;
    const fileTypeResult = fileType(buffer);
    let type, ext;
    if (!fileTypeResult && isSvg(buffer)) {
      type = 'image/svg+xml';
      ext = 'svg';
    } else {
      type = fileTypeResult.mime;
      ext = fileTypeResult.ext;
    }
    const blob = new Blob([buffer], { type });
    const blobUrl = URL.createObjectURL(blob);
    return state.set('processedImage', Map({
      size: payload.byteLength,
      type,
      ext,
      buffer,
      url: blobUrl,
    }));
  },
  MINIFY_BUFFER: state => state,
}, defaultState);

export default imageProcessReducer;
