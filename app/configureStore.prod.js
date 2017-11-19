import { applyMiddleware, createStore, compose } from 'redux';
import promiseMiddleware from 'redux-promise';
import persistState from 'redux-localstorage';
import createRavenMiddleware from 'raven-for-redux';

import reducer from './reducer';

window.Raven.config('https://d2e7d99b1c414fe0ab0b02b67f17c1c8@sentry.io/247420').install();

const enhancer = compose(
  applyMiddleware(
    promiseMiddleware,
    createRavenMiddleware(window.Raven, {
    }),
  ),
  persistState(['page.project', 'page.console', 'page.user'])
);

export default createStore(reducer, enhancer);
