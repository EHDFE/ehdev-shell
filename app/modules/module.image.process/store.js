import { basename } from 'path';
import { Map } from 'immutable';
import { createActions, handleActions } from 'redux-actions';
import fileType from 'file-type';
import isSvg from 'is-svg';
import sizeOf from 'image-size';
import IMAGE_MIN_API from '../../apis/imagemin';
import { getAvailableProcessors } from './processorExport';

const defaultState = Map({
  images: Map(),
  processors: Map(),
});
export const UNPROCESSED = 'UNPROCESSED';
export const IN_PROGRESS = 'IN_PROGRESS';
export const PROCESSED = 'PROCESSED';

export const actions = createActions({
  ADD: files => files,
  REMOVE: filePaths => filePaths,
  BEFORE_MINIFY: ids => ids,
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
  SET_STATUS: (id, status) => ({
    id,
    status,
  }),
  CHANGE_PROCESSOR: (id, processor) => ({
    id,
    processor,
  }),
  UPDATE_PROCESSOR_CONFIG: (id, config) => ({
    id,
    config,
  }),
  GET_SSIM_SCORE: async (input1, input2) => {
    try {
      const result = await IMAGE_MIN_API.getSSIMScore(input1, input2);
      return {
        id: input1,
        score: result,
      };
    } catch (e) {
      throw e;
    }
  }
});

const imageProcessReducer = handleActions({
  ADD: (state, { payload }) => {
    const files = Array.isArray(payload) ? payload : [payload];
    return state
      .update('images', images => images.withMutations(map => {
        files.forEach(file => {
          let dimensions;
          if (file.type.startsWith('image/')) {
            dimensions = sizeOf(file.path);
          }
          map.set(file.path, Map({
            originalImage: Map({
              name: file.name,
              path: file.path,
              url: `file://${file.path}`,
              size: file.size,
              type: file.type,
              dimensions: dimensions && Map({
                width: dimensions.width,
                height: dimensions.height,
              }),
            }),
            processedImage: Map(),
            status: UNPROCESSED,
          }));
        });
      }))
      .update('processors', processors => processors.withMutations(map => {
        files.forEach(file => {
          const availableProcessors = getAvailableProcessors(file.type);
          map.set(file.path, Map({
            processor: availableProcessors.get(0, null),
            availableProcessors,
            config: {},
          }));
        });
      }));
  },
  REMOVE: (state, { payload }) => {
    let filePaths;
    if (Array.isArray(payload)) {
      filePaths = payload;
    } else {
      filePaths = [ payload ];
    }
    return state
      .update('images', map => map.deleteAll(filePaths))
      .update('processors', map => map.deleteAll(filePaths));
  },
  CHANGE_PROCESSOR: (state, { payload }) => {
    const { id, processor } = payload;
    return state.updateIn(
      ['processors', id],
      map => map.set(
        'processor', processor
      ).set('config', {})
    );
  },
  UPDATE_PROCESSOR_CONFIG: (state, { payload }) => {
    const { id, config } = payload;
    return state.updateIn(
      ['processors', id, 'config'],
      oldConfig => Object.assign(oldConfig, config)
    );
  },
  BEFORE_MINIFY: (state, { payload }) => {
    const ids = payload;
    return state.update('images', images => {
      return images.withMutations(map => {
        ids.forEach(id => {
          map.setIn([id, 'status'], IN_PROGRESS);
        });
      });
    });
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
        fileName: basename(filePath, `.${ext}`),
      })).set('status', PROCESSED)
    );
  },
  SET_STATUS(state, { payload }) {
    const { id, status } = payload;
    return state.setIn(['images', id, 'status'], status);
  },
  GET_SSIM_SCORE(state, { error, payload }) {
    if (error) return state;
    const { id, score } = payload;
    return state.setIn(['images', id, 'processedImage', 'SSIM'], score);
  },
}, defaultState);

export default imageProcessReducer;
