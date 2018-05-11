import { applyMiddleware, createStore } from 'redux';
import promiseMiddleware from 'redux-promise';
import createRavenMiddleware from 'raven-for-redux';
// import localforage from 'localforage';

import reducer from './reducer';

window.Raven.config('https://d2e7d99b1c414fe0ab0b02b67f17c1c8@sentry.io/247420').install();

export default () => {
  const enhancer = applyMiddleware(
    promiseMiddleware,
    createRavenMiddleware(window.Raven),
  );
  const store = createStore(reducer, enhancer);
  return {
    store,
  };
};
