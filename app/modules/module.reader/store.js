import { Map, Set, getIn } from 'immutable';
import { createActions, handleActions } from 'redux-actions';
import READER_API from '../../apis/reader';

const defaultState = Map({
  categoryIds: Set(),
  categoryEntity: Map(),
  feedIds: Set(),
  feedEntity: Map(),
  categoryId: undefined,
  feedId: undefined,
  streamEntity: Map(),
});

export const actions = createActions({
  SET_CATEGORY: id => id,
  SELECT_FEED: id => id,
  async GET_FEEDS() {
    return await READER_API.getFeeds();
  },
  async CREATE_CATEGORY(category) {
    return await READER_API.createCategory(category);
  },
  UPDATE_CATEGORY() {},
  REMOVE_CATEGORY() {},
  async ADD_FEED(pid, data) {
    try {
      await READER_API.addFeed(pid, data);
      return {
        pid,
        data,
      };
    } catch (e) {
      throw Error(e);
    }
  },
  async REMOVE_FEED(pid, id) {
    try {
      await READER_API.removeFeed(pid, id);
      return {
        pid,
        id,
      };
    } catch (e) {
      throw Error(e);
    }
  },
  ON_LOAD_STREAM: id => id,
  async LOAD_STREAM(id, options) {
    // console.log(id, options);
    return await READER_API.loadFeedStream(id, options);
  },
});

const reducer = handleActions({
  SET_CATEGORY(state, { payload }) {
    const feedId = state.getIn(['categoryEntity', payload, 'outline', 0], undefined);
    return state
      .set('categoryId', payload)
      .set('feedId', feedId);
  },
  SELECT_FEED(state, { payload }) {
    return state.set('feedId', payload);
  },
  GET_FEEDS(state, { error, payload }) {
    if (error) return state;
    const categoryEntity = {};
    const feedEntity = {};
    const feedIds = [];
    const categoryIds = [];
    const streamEntity = {};
    payload.forEach(d => {
      categoryIds.push(d._id);
      const outlineIds = [];
      d.outline.forEach(feed => {
        feedIds.push(feed._id);
        outlineIds.push(feed._id);
        Object.assign(feedEntity, {
          [feed._id]: Map(feed),
        });
        Object.assign(streamEntity, {
          [feed._id]: Map(),
        });
      });
      Object.assign(categoryEntity, {
        [d._id]: Map({
          ...d,
          outline: Set(outlineIds),
        }),
      });
    });
    const defaultCategoryId = categoryIds.length > 0 ? categoryIds[0] : undefined;
    const defaultFeedId = categoryEntity[defaultCategoryId] ?
      getIn(categoryEntity[defaultCategoryId], ['outline', 0], undefined) : undefined;
    return state
      .set('categoryIds', Set(categoryIds))
      .set('categoryEntity', Map(categoryEntity))
      .set('feedIds', Set(feedIds))
      .set('feedEntity', Map(feedEntity))
      .set('streamEntity', Map(streamEntity))
      .set('categoryId', defaultCategoryId)
      .set('feedId', defaultFeedId);
  },
  CREATE_CATEGORY(state, { payload }) {
    return state;
  },
  UPDATE_CATEGORY() {},
  REMOVE_CATEGORY() {},
  ADD_FEED(state, { error, payload }) {
    if (error) return state;
    const { pid, data } = payload;
    return state
      .updateIn(['categoryEntity', pid, 'outline'], set => set.add(data._id))
      .update('feedIds', set => set.add(data._id))
      .setIn(['feedEntity', data._id], Map(data))
      .setIn(['streamEntity', data._id], Map());
  },
  REMOVE_FEED(state, { error, payload }) {
    if (error) return state;
    const { pid, id } = payload;
    return state
      .updateIn(['categoryEntity', pid, 'outline'], set => set.delete(id))
      .update('feedIds', set => set.remove(id))
      .deleteIn(['feedEntity', id])
      .deleteIn(['streamEntity', id]);
  },
  ON_LOAD_STREAM(state, { payload }) {
    return state.updateIn(['streamEntity', payload], map => map.set('pending', true));
  },
  LOAD_STREAM(state, { error, payload }) {
    if (error) return state;
    const { continuation, items, id, updated } = payload;
    const itemIds = Set(items.map(d => d.id));
    return state
      .updateIn(
        ['streamEntity', id],
        map => map.withMutations(map => {
          map
            .set('continuation', continuation)
            .set('updated', updated)
            .set('pending', false)
            .set('itemIds', map.get('itemIds', Set()).concat(itemIds));
        })
      );
  },
}, defaultState);

export default reducer;
