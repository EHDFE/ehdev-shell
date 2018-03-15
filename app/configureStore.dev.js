import { applyMiddleware, createStore, compose } from 'redux';
import { createLogger } from 'redux-logger';
import promiseMiddleware from 'redux-promise';
import { persistStore, persistReducer } from 'redux-persist';
import localforage from 'localforage';

import reducer from './reducer';
import DevTools from './DevTools';

const logger = createLogger({
  level: 'info',
});

const persistConfig = {
  key: 'APP',
  storage: localforage,
  debug: process.env.NODE_ENV === 'production',
};

const persistedReducer = persistReducer(persistConfig, reducer);

const monitorReducer = (state = {}, action) => state;

const enhancer = compose(
  applyMiddleware(
    promiseMiddleware,
    logger,
  ),
  DevTools.instrument(monitorReducer, {
    maxAge: 50,
    shouldCatchErrors: true,
  })
);

export default () => {
  const store = createStore(persistedReducer, enhancer);
  const persistor = persistStore(store);

  if (module.hot) {
    module.hot.accept(async () => {
      const nextRootReducer = await import('./reducer');
      store.replaceReducer(
        persistReducer(persistConfig, nextRootReducer)
      );
    });
  }

  return {
    store,
    persistor,
  };
};
