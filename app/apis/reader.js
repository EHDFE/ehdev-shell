/**
 * Reader api
 */

import { remoteAPI } from './utils';

const READER_API = {
  search(query) {
    return remoteAPI.reader.search(query);
  },
  getFeeds() {
    return remoteAPI.reader.getFeeds();
  },
  createCategory(category) {
    return remoteAPI.reader.createCategory(category);
  },
  updateCategory(pid, newCategory) {
    return remoteAPI.reader.updateCategory(pid, newCategory);
  },
  removeCategory(pid) {
    return remoteAPI.reader.removeCategory(pid);
  },
  addFeed(pid, feedData) {
    return remoteAPI.reader.addFeed(pid, feedData);
  },
  removeFeed(pid, id) {
    return remoteAPI.reader.removeFeed(pid, id);
  },
  loadFeedStream(id, options) {
    return remoteAPI.reader.loadFeedStream(id, options);
  },
};

export default READER_API;
