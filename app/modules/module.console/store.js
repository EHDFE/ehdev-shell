/**
 * Console Store
 * @author hefan
 */
import { createActions, handleActions } from 'redux-actions';
import moment from 'moment';

const defaultState = {
  ids: [],
  entities: {},
  activeId: null,
  visible: false,
};

/**
 * Console's action
 */
export const actions = createActions({
  CREATE_LOG: (pid, category, content) => {
    return {
      category,
      content,
      id: pid,
      updateTime: moment().valueOf(),
      checked: false,
    };
  },
  DELETE_LOG: id => {
    return id;
  },
  ACTIVE_LOG: id => {
    return id;
  },
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
    CREATE_LOG: (state, { payload }) => {
      const { id, content } = payload;
      let entity, ids;
      if (state.ids.includes(id)) {
        entity = {
          ...state.entities[id],
          content: state.entities[id].content + content,
          updateTime: payload.updateTime,
          checked: payload.checked,
        };
        ids = [...state.ids];
      } else {
        ids = [id, ...state.ids];
        entity = payload;
      }
      return {
        ids,
        entities: {
          ...state.entities,
          [id]: entity,
        },
        activeId: id,
        visible: state.visible,
      };
    },
    DELETE_LOG: (state, { payload }) => {
      const newIds = state.ids.filter(id => id !== payload);
      const newEntities = Object.assign({}, state.entities);
      delete newEntities[payload];
      return {
        ids: newIds,
        entities: newEntities,
        activeId: newIds.length > 0 ? newIds[0] : null,
        visible: state.visible,
      };
    },
    ACTIVE_LOG: (state, { payload }) => {
      if (!state.ids.includes(payload)) return state;
      return {
        ...state,
        entities: {
          ...state.entities,
          [payload]: Object.assign(state.entities[payload], {
            checked: true,
          }),
        },
        activeId: payload,
      };
    },
    TOGGLE_VISIBLE: (state) => {
      return {
        ...state,
        visible: !state.visible,
      };
    },
    SET_VISIBLE: (state) => {
      return {
        ...state,
        visible: state.visible,
      };
    },
    SET_INVISIBLE: (state) => {
      return {
        ...state,
        visible: state.visible,
      };
    },
  },
  defaultState
);

export default consoleReducer;
