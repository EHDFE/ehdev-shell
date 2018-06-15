import { Map } from 'immutable';
import { createActions, handleActions } from 'redux-actions';
import fileType from 'file-type';
import isSvg from 'is-svg';
import sizeOf from 'image-size';
import IMAGE_MIN_API from '../../apis/imagemin';

const defaultState = Map({
  images: Map(),
});

export const actions = createActions({
  ADD: files => files,
  REMOVE: filePath => filePath,
  MINIFY: async (input, plugin, options) => {
    let result;
    try {
      result = await IMAGE_MIN_API.process(input, plugin, options);
    } catch (e) {
      throw e;
    }
    return {
      result,
      filePath: input,
    };
  },
  MINIFY_BUFFER: async (buffer) => {
    return IMAGE_MIN_API.processBuffer(buffer);
  },
});

const imageProcessReducer = handleActions({
  ADD: (state, { payload }) => {
    const files = Array.isArray(payload) ? payload : [payload];
    return state.update(
      'images',
      images => images.withMutations(map => {
        files.forEach(file => {
          const dimensions = sizeOf(file.path);
          map.set(file.path, Map({
            originalImage: Map({
              name: file.name,
              path: file.path,
              url: `file://${file.path}`,
              size: file.size,
              type: file.type,
              dimensions: Map({
                width: dimensions.width,
                height: dimensions.height,
              }),
            }),
            processedImage: Map(),
          }));
        });
      })
    );
  },
  REMOVE: (state, { payload }) => {
    return state.deleteIn(['images', payload]);
  },
  MINIFY: (state, { payload, error }) => {
    if (error) return state;
    const {
      result,
      filePath,
    } = payload;
    const buffer = result;
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
    return state.updateIn(
      ['images', filePath],
      map => map.set('processedImage', Map({
        size: buffer.byteLength,
        type,
        ext,
        buffer,
        url: blobUrl,
      }))
    );
  },
  MINIFY_BUFFER: state => state,
}, defaultState);

export default imageProcessReducer;
