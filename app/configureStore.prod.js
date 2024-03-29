import Raven from 'raven-js';
import { applyMiddleware, createStore } from 'redux';
import promiseMiddleware from 'redux-promise';
import createRavenMiddleware from 'raven-for-redux';
import { persistStore, persistReducer } from 'redux-persist';
import createElectronStorage from 'redux-persist-electron-storage';
import immutableTransform from 'redux-persist-transform-immutable';

import reducer from './reducer';

const persistConfig = {
  key: 'App',
  storage: createElectronStorage(),
  transforms: [immutableTransform()],
  blacklist: [
    'page.image.process',
    'page.reader',
    'page.portal',
  ],
};

const enhancer = applyMiddleware(
  promiseMiddleware,
  createRavenMiddleware(Raven),
);

const persistedReducer = persistReducer(persistConfig, reducer);

export default () => {
  const store = createStore(persistedReducer, enhancer);
  const persistor = persistStore(store);

  return {
    store,
    persistor,
  };
};
