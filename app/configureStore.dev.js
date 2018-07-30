import { isImmutable } from 'immutable';
import { applyMiddleware, compose, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import promiseMiddleware from 'redux-promise';
import { persistStore, persistReducer } from 'redux-persist';
import createElectronStorage from 'redux-persist-electron-storage';
import DevTools from './DevTools';
import reducer from './reducer';
import immutableTransform from 'redux-persist-transform-immutable';

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

const logger = createLogger({
  level: 'info',
  stateTransformer: state => {
    if (isImmutable(state)) return state.toJS();
    const output = {};
    Object.keys(state).forEach(key => {
      if (isImmutable(state[key])) {
        Object.assign(output, {
          [key]: state[key].toJS(),
        });
      } else {
        Object.assign(output, {
          [key]: state[key],
        });
      }
    });
    return output;
  },
});

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

const persistedReducer = persistReducer(persistConfig, reducer);

export default () => {
  const store = createStore(persistedReducer, enhancer);
  const persistor = persistStore(store);
  if (module.hot) {
    module.hot.accept(async () => {
      const nextRootReducer = await import('./reducer');
      store.replaceReducer(nextRootReducer);
    });
  }

  return {
    store,
    persistor,
  };
};
