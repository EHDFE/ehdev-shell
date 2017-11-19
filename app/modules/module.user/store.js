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
    github: '',
    bio: '',
    address: '',
  },
};

export const actions = createActions({
  USER: {
    SET: user => user,
  },
});

const userReducer = handleActions(
  {
    'USER/SET': (state, { payload = {} }) => {
      const { avatar, name, github, bio, address } = payload;
      // window.localStorage.setItem('user', JSON.stringify(payload));
      return {
        avatar,
        name,
        github,
        bio,
        address,
      };
    },
  },
  defaultState.user
);

export default combineReducers({
  user: userReducer,
});
