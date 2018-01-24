/**
 * Console Store
 * @author hefan
 * TODO: set max lines for each config
 */
import { createActions, handleActions } from 'redux-actions';
import moment from 'moment';

const MAX_CONSOLE_ITEM_LIMIT = 10;
const MAX_LOG_LENGTH = 10000;

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
  CREATE_LOG: (pid, category, content, args, root) => {
    return {
      category,
      content,
      id: category === 'OTHER' ? 0 : pid,
      updateTime: moment().valueOf(),
      checked: false,
      projectName: args.projectName,
      root,
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
      const { id, content, category } = payload;
      let entity, ids;
      if (state.ids.includes(id)) {
        let newContent = state.entities[id].content + content;
        if (category === 'OTHER') {
          if (newContent.length > MAX_LOG_LENGTH) {
            newContent = newContent.substr(newContent.length - MAX_LOG_LENGTH);
          }
        }
        entity = {
          ...state.entities[id],
          content: newContent,
          updateTime: payload.updateTime,
          checked: payload.checked,
          projectName: payload.projectName,
        };
        ids = [...state.ids];
      } else {
        ids = [id, ...state.ids];
        entity = payload;
      }
      const entities = {
        ...state.entities,
        [id]: entity,
      };
      if (ids.length > MAX_CONSOLE_ITEM_LIMIT + 1) {
        const idx = ids.indexOf(0);
        let remainIds;
        if (idx === -1) {
          remainIds = ids;
        } else {
          remainIds = ids.slice(0, idx).concat(ids.slice(idx + 1));
        }
        const deleteIds = remainIds.splice(MAX_CONSOLE_ITEM_LIMIT);
        if (idx !== -1) {
          remainIds.unshift(0);
        }
        deleteIds.forEach(id => {
          delete entities[id];
        });
        ids = remainIds;
      }
      return {
        ...state,
        ids,
        entities,
        activeId: category === 'OTHER' ? state.activeId : id,
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
