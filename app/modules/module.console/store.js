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
      };
    },
  },
  defaultState
);

export default consoleReducer;
