/**
 * Console Store
 * @author hefan
 * TODO: set max lines for each config
 */
import { Set, Map } from 'immutable';
import { createActions, handleActions } from 'redux-actions';

const defaultState = Map({
  ids: Set([]),
  entities: Map({}),
  activeId: null,
  visible: false,
  width: 620,
  height: 400,
});

/**
 * Console's action
 */
export const actions = createActions({
  CREATE: id => ({
    id,
  }),
  SET_ACTIVE: id => id,
  RESIZE: (width, height) => ({
    width,
    height,
  }),
  SET_VISIBLE: () => ({
    visible: true,
  }),
  SET_INVISIBLE: () => ({
    visible: false,
  }),
}, 'TOGGLE_VISIBLE');

/**
 * Console's  reducer
 */
const consoleReducer = handleActions(
  {
    CREATE: state => {
      return state;
    },
    SET_ACTIVE: (state, { payload }) => {
      return state.set('activeId', payload);
    },
    RESIZE: (state, { payload }) => {
      const { width, height } = payload;
      return state.set('width', width).set('height', height);
    },
    TOGGLE_VISIBLE: (state) => {
      return state.set('visible', !state.get('visible'));
    },
    SET_VISIBLE: (state) => {
      return state.set('visible', true);
    },
    SET_INVISIBLE: (state) => {
      return state.set('visible', false);
    },
  },
  defaultState
);

export default consoleReducer;
