import { applyMiddleware, createStore, compose } from 'redux';
import { createLogger } from 'redux-logger';
import promiseMiddleware from 'redux-promise';
import persistState from 'redux-localstorage';
import createRavenMiddleware from 'raven-for-redux';

import reducer from './reducer';
import DevTools from './DevTools';

window.Raven.config('https://d2e7d99b1c414fe0ab0b02b67f17c1c8@sentry.io/247420').install();

const logger = createLogger({
  level: 'info',
});

const monitorReducer = (state = {}, action) => state;

const enhancer = compose(
  applyMiddleware(
    promiseMiddleware,
    logger,
    createRavenMiddleware(window.Raven, {
    })
  ),
  persistState(['page.dashboard', 'page.project', 'page.console', 'page.user']),
  DevTools.instrument(monitorReducer, {
    maxAge: 50,
    shouldCatchErrors: true,
  })
);

export default createStore(reducer, enhancer);
