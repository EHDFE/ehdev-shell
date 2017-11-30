/**
 * Pomodora Store
 * @author ryan.bian
 */
import { createActions, handleActions } from 'redux-actions';
import moment from 'moment';
import { clearTimeout, setTimeout } from 'timers';

const MILLISECONDS_IN_MINUTE = 60 * 1000;

const defaultState = {
  history: [],
  current: {}
};

let tickTimer;

export const actions = createActions({
  CREATE_JOB: ({ title }, periods, dispatch) => {
    const timestamp = moment().unix();
    tickTimer && clearTimeout(tickTimer);
    tickTimer = setTimeout(() => {
      dispatch(actions.setRest(periods, dispatch));
    }, periods.focusPeriod * MILLISECONDS_IN_MINUTE);
    return {
      id: ['job', timestamp].join(''),
      title,
      status: 'focus',
      times: [
        {
          time: timestamp,
          action: 'start',
        },
      ],
    };
  },
  SET_REST: (periods, dispatch) => {
    tickTimer && clearTimeout(tickTimer);
    tickTimer = setTimeout(() => {
      dispatch(actions.setFocus(periods, dispatch));
    }, periods.restPeriod * MILLISECONDS_IN_MINUTE);
    return {
      time: moment().unix(),
    };
  },
  SET_FOCUS: (periods, dispatch) => {
    tickTimer && clearTimeout(tickTimer);
    tickTimer = setTimeout(() => {
      dispatch(actions.setRest(periods, dispatch));
    }, periods.focusPeriod * MILLISECONDS_IN_MINUTE);
    return {
      time: moment().unix(),
    };
  },
  FINISH_JOB: dispatch => {
    tickTimer && clearTimeout(tickTimer);
    return {
      time: moment().unix(),
    };
  },
});

const reducer = handleActions({
  CREATE_JOB: (state, { payload }) => {
    return {
      ...state,
      current: {
        ...payload,
      },
    };
  },
  SET_REST: (state, { payload }) => {
    return {
      ...state,
      current: {
        ...state.current,
        status: 'rest',
        times: [
          ...state.current.times,
          {
            time: payload.time,
            action: 'rest',
          },
        ]
      }
    };
  },
  SET_FOCUS: (state, { payload }) => {
    return {
      ...state,
      current: {
        ...state.current,
        status: 'focus',
        times: [
          ...state.current.times,
          {
            time: payload.time,
            action: 'focus',
          },
        ]
      }
    };
  },
  FINISH_JOB: (state, { payload }) => {
    return {
      history: [
        ...state.history,
        {
          ...state.current,
          status: 'finished',
          times: [
            ...state.current.times,
            {
              time: payload.time,
              action: 'stop'
            },
          ],
        }
      ],
      current: {},
    };
  },
}, defaultState);

export default reducer;
