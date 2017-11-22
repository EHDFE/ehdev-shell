/**
 * ImageLayout Store
 * @author ryan.bian
 */
import { createActions, handleActions, combineActions } from 'redux-actions';

import COMMON_API from '../../apis/common';

const defaultState = {
  url: undefined,
};

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
});

const reducer = handleActions({
  'GET_WALLPAPER_INFO': (state, { payload, error }) => {
    if (error) return state;
    return {
      ...payload,
    };
  },
}, defaultState);


export default reducer;
