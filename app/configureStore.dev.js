import { isImmutable } from 'immutable';
// import localforage from 'localforage';
import { applyMiddleware, compose, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import promiseMiddleware from 'redux-promise';
import DevTools from './DevTools';
import reducer from './reducer';

const logger = createLogger({
  level: 'info',
  stateTransformer: state => {
    if (isImmutable(state)) return state.toJS();
    return state;
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

export default () => {
  const store = createStore(reducer, enhancer);

  if (module.hot) {
    module.hot.accept(async () => {
      const nextRootReducer = await import('./reducer');
      store.replaceReducer(nextRootReducer);
    });
  }

  return {
    store,
  };
};
