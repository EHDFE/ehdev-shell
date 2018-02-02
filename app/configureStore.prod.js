import { applyMiddleware, createStore, compose } from 'redux';
import promiseMiddleware from 'redux-promise';
import createRavenMiddleware from 'raven-for-redux';
import { persistStore, persistReducer } from 'redux-persist';
import localforage from 'localforage';

import reducer from './reducer';

window.Raven.config('https://d2e7d99b1c414fe0ab0b02b67f17c1c8@sentry.io/247420').install();

const persistConfig = {
  key: 'APP',
  storage: localforage,
  debug: process.env.NODE_ENV === 'production',
};

const persistedReducer = persistReducer(persistConfig, reducer);

const enhancer = compose(
  applyMiddleware(
    promiseMiddleware,
    createRavenMiddleware(window.Raven, {
    }),
  ),
);

export default () => {
  const store = createStore(persistedReducer, enhancer);
  const persistor = persistStore(store);
  return {
    store,
    persistor,
  };
};
