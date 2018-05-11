/**
 * Setting Store
 * @author grootfish
 */
import { createActions, handleActions } from 'redux-actions';
import { Map } from 'immutable';

const defaultState = Map({
  avatar: '',
  name: '',
  github: '',
  bio: '',
  address: '',
});

export const actions = createActions({
  USER: {
    SET: user => user,
  },
});

const userReducer = handleActions(
  {
    'USER/SET': (state, { payload = {} }) => {
      const { avatar, name, github, bio, address } = payload;
      return state.merge({
        avatar,
        name,
        github,
        bio,
        address,
      });
    },
  },
  defaultState,
);

export default userReducer;
