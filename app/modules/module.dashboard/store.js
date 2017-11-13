/**
 * Dashboard Store
 * @author ryan.bian
 */
import { combineReducers } from 'redux';
import { createActions, handleActions, handleAction } from 'redux-actions';
import moment from 'moment';

import DASHBOARD_API from '../../apis/dashboard';
import { WEATHER_APPID } from '../../CONFIG';

const defaultState = {
  base: {},
  projects: {
    list: [],
  },
};

export const actions = createActions({
  BASE: {
    GET_WEATHER: async () => {
      const response = await fetch(`//api.openweathermap.org/data/2.5/weather?id=1808926&units=metric&APPID=${WEATHER_APPID}`);
      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw Error(e);
      }
      return result;
    },
    GET_DATE: () => {
      const today = moment();
      return {
        weekday: today.day(),
        date: today.format('YYYY-DD-MM'),
      };
    },
  },
  PROJECTS: {
    GET_LIST: async () => {
      const { docs } = await DASHBOARD_API.projects.getList();
      return docs;
    },
  },
});

const baseReducer = handleActions({
  'BASE/GET_WEATHER': (state, { payload, error }) => {
    if (error) return state;
    return {
      ...state,
      weather: payload,
    };
  },
  'BASE/GET_DATE': (state, { payload }) => {
    return {
      ...state,
      ...payload,
    };
  },
}, defaultState.base);

const projectsReducer = handleActions({
  'PROJECTS/GET_LIST': (state, { payload }) => {
    return {
      ...state,
      list: payload,
    };
  }
}, defaultState.projects);

export default combineReducers({
  base: baseReducer,
  projects: projectsReducer,
});
