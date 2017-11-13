/**
 * Setting Store
 * @author grootfish
 */
import { combineReducers } from 'redux';
import { createActions, handleActions } from 'redux-actions';

const defaultState = {
  user: {
    avatar: '',
    name: '',
  },
};

export const actions = createActions({
  USER: {
    GET: ()=>{
      const user = window.localStorage.getItem('user') || '{}';
      return user;
    },
    SET: user=>user
  }
});

const userReducer = handleActions({
  'USER/GET': (state, {payload})=>{
    const {avatar, name} = JSON.parse(payload);
    return {
      avatar, name
    };
  },
  'USER/SET': (state, {payload = {}})=>{
    const {avatar, name} = payload;
    window.localStorage.setItem('user', JSON.stringify(payload));
    return {
      avatar, name
    };
  }
}, defaultState.user);

export default combineReducers({
  user: userReducer,
});
