/**
 * Dashboard Store
 * @author ryan.bian
 */
import { combineReducers } from 'redux';
import { createActions, handleActions } from 'redux-actions';

const defaultState = {
  projects: {},
};

export const actions = createActions({

});

const projectsReducer = handleActions({

}, defaultState.projects);

export default combineReducers({
  projects: projectsReducer,
});
