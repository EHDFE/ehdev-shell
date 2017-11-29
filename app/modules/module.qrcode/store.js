/**
 * QrCode store
 * @author: ryan.bian
 */
import { createActions, handleActions } from 'redux-actions';

import COMMON_API from '../../apis/common';

const defaultState = {};

export const actions = createActions({
  GENERATE: async (text) => {
    const { url } = await COMMON_API.getQrCode(text);
    return {
      url,
    };
  },
});

const reducer = handleActions({
  GENERATE: (state, { payload, error }) => {
    if (error) return state;
    return {
      ...state,
      url: payload.url,
    };
  },
}, defaultState);

export default reducer;
