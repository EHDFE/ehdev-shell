import { applyMiddleware, createStore, compose } from 'redux';
import { createLogger } from 'redux-logger';
import promiseMiddleware from 'redux-promise';

import reducer from './reducer';
import DevTools from './DevTools';

const logger = createLogger({
  level: 'info',
});

const monitorReducer = (state = {}, action) => state;

const enhancer = compose(
  applyMiddleware(promiseMiddleware, logger),
  DevTools.instrument(monitorReducer, {
    maxAge: 50,
    shouldCatchErrors: true,
  })
);

export default createStore(reducer, enhancer);
