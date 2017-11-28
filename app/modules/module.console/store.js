/**
 * Console Store
 * @author hefan
 */
import { createActions, handleActions } from 'redux-actions';

const getTime = () => new Date().getTime();

const defaultState = {
  content: '',
  lastLog: {
    content: '',
    t: getTime(),
  },
  visible: false,
};

/**
 * Console's action
 */
export const actions = createActions({
  UPDATE_LOG: log => {
    return {
      log,
      t: getTime(),
    };
  },
  CLEAN: () => ({
    t: getTime(),
  }),
  TOGGLE_VISIBLE: () => ({
  }),
  SET_VISIBLE: () => ({
    visible: true,
  }),
  SET_INVISIBLE: () => ({
    visible: false,
  }),
});

/**
 * Console's  reducer
 */
const consoleReducer = handleActions(
  {
    UPDATE_LOG: (state, { payload }) => {
      const { log, t } = payload;
      return {
        content: [
          state.content,
          log,
        ].join(''),
        lastLog: {
          content: log,
          t,
        },
        visible: state.visible,
      };
    },
    CLEAN: (state, { payload }) => {
      const { t } = payload;
      return {
        content: '',
        lastLog: {
          content: '',
          t,
        },
        visible: state.visible,
      };
    },
    TOGGLE_VISIBLE: (state) => {
      return {
        ...state,
        lastLog: {
          ...state.lastLog,
        },
        visible: !state.visible,
      };
    },
    SET_VISIBLE: (state) => {
      return {
        ...state,
        lastLog: {
          ...state.lastLog,
        },
        visible: state.visible,
      };
    },
    SET_INVISIBLE: (state) => {
      return {
        ...state,
        lastLog: {
          ...state.lastLog,
        },
        visible: state.visible,
      };
    },
  },
  defaultState
);

export default consoleReducer;
