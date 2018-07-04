/**
 * reducer of Setting
 * @author ryan.bian
 */
import { Map, Set } from 'immutable';
import { createActions, handleActions } from 'redux-actions';

const defaultState = Map({
  enabledModules: Set(),
});

export const actions = createActions({
  ENABLE_MODULE: name => name,
  DISABLE_MODULE: name => name,
});

const reducer = handleActions({
  ENABLE_MODULE(state, { payload }) {
    return state.update('enabledModules', Set(), set => set.add(payload));
  },
  DISABLE_MODULE(state, { payload }) {
    return state.update('enabledModules', Set(), set => set.remove(payload));
  },
}, defaultState);

export default reducer;
