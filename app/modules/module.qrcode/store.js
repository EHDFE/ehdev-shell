/**
 * QrCode store
 * @author: ryan.bian
 */
import { Map } from 'immutable';
import { createActions, handleActions } from 'redux-actions';
import COMMON_API from '../../apis/common';


const defaultState = Map({});

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
    return state.set('url', payload.url);
  },
}, defaultState);

export default reducer;
