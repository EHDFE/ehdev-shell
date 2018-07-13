import { basename } from 'path';
import { Map } from 'immutable';
import { createActions, handleActions } from 'redux-actions';
import fileType from 'file-type';
import isSvg from 'is-svg';
import sizeOf from 'image-size';
import IMAGE_API from '../../apis/image';
import { getAvailableProcessors } from './processorExport';

const defaultState = Map({
  images: Map(),
  processors: Map(),
  pending: false,
});
export const UNPROCESSED = 'UNPROCESSED';
export const IN_PROGRESS = 'IN_PROGRESS';
export const PROCESSED = 'PROCESSED';

const IMAGE_SIZE_DEFINE = new window.Map([
  ['thumb', [120, 64]],
  ['preview', [1920, 1080]],
]);

const GENERATE_PREVIEW_IMAGE_EXCLUDE_LIST = [
  'svg',
  'gif',
];

const getFilePropertyFromBuffer = buffer => {
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
  return {
    url: URL.createObjectURL(blob),
    type,
    ext,
  };
};

export const actions = createActions({
  BEFORE_ADD: () => ({
    pending: true,
  }),
  ADD: async files => {
    const fileList = Array.isArray(files) ? files : [files];
    const payload = [];
    for (const file of fileList) {
      const entity = {
        file,
      };
      if (file.type.startsWith('image/')) {
        const dimensions = sizeOf(file.path);
        const thumbBuffer = await IMAGE_API.resize(file.path, ...IMAGE_SIZE_DEFINE.get('thumb'));
        const thumbProp = getFilePropertyFromBuffer(thumbBuffer);
        let previewUrl;
        if (GENERATE_PREVIEW_IMAGE_EXCLUDE_LIST.some(ext => file.type.includes(ext))) {
          previewUrl = `file://${file.path}`;
        } else {
          const previewBuffer = await IMAGE_API.resize(file.path, ...IMAGE_SIZE_DEFINE.get('preview'));
          const previewProp = getFilePropertyFromBuffer(previewBuffer);
          previewUrl = previewProp.url;
        }
        Object.assign(entity, {
          dimensions,
          thumbUrl: thumbProp.url,
          previewUrl,
        });
      } else {
        const path = `file://${file.path}`;
        Object.assign(entity, {
          thumbUrl: path,
          previewUrl: path,
        });
      }
      payload.push(entity);
    }
    return payload;
  },
  REMOVE: filePaths => filePaths,
  BEFORE_MINIFY: ids => ids,
  MINIFY: async (input, plugin, options) => {
    let result;
    try {
      result = await IMAGE_API.process(input, plugin, options);
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
      const result = await IMAGE_API.getSSIMScore(input1, input2);
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
  BEFORE_ADD: state => {
    return state.set('pending', true);
  },
  ADD: (state, { error, payload }) => {
    if (error) return payload;
    const fileList = payload;
    return state
      .update('images', images => images.withMutations(map => {
        fileList.forEach(entity => {
          const { file, dimensions } = entity;
          map.set(file.path, Map({
            originalImage: Map({
              name: file.name,
              path: file.path,
              url: entity.previewUrl,
              thumbUrl: entity.thumbUrl,
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
        fileList.forEach(entity => {
          const { file } = entity;
          const availableProcessors = getAvailableProcessors(file.type);
          map.set(file.path, Map({
            processor: availableProcessors.get(0, null),
            availableProcessors,
            config: {},
          }));
        });
      }))
      .set('pending', false);
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
    const { url, type, ext } = getFilePropertyFromBuffer(buffer);
    return state.updateIn(
      ['images', filePath],
      map => map.set('processedImage', Map({
        size: buffer.byteLength,
        type,
        ext,
        buffer,
        url,
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
