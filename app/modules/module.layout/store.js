/**
 * ImageLayout Store
 * @author ryan.bian
 */
import { Map } from 'immutable';
import { createActions, handleActions } from 'redux-actions';
import COMMON_API from '../../apis/common';


const defaultState = Map({
  url: undefined,
  previewMode: false,
});

export const actions = createActions({
  GET_WALLPAPER_INFO: async date => {
    let res;
    try {
      res = await COMMON_API.wallpaper.getBingWallpaper(date);
    } catch (e) {
      throw Error(e);
    }
    return res;
  },
  TOGGLE_PREVIEW_MODE: () => {
    return {};
  },
});

const reducer = handleActions({
  GET_WALLPAPER_INFO: (state, { payload, error }) => {
    if (error) return state;
    return state.merge(payload);
  },
  TOGGLE_PREVIEW_MODE: (state, { payload }) => {
    return state.set('previewMode', !state.get('previewMode'));
  },
}, defaultState);


export default reducer;
