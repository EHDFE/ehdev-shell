import { applyMiddleware, createStore, compose } from 'redux';
import promiseMiddleware from 'redux-promise';
import createRavenMiddleware from 'raven-for-redux';
import localforage from 'localforage';

import reducer from './reducer';

window.Raven.config('https://d2e7d99b1c414fe0ab0b02b67f17c1c8@sentry.io/247420').install();

const enhancer = compose(
  applyMiddleware(
    promiseMiddleware,
    createRavenMiddleware(window.Raven, {
    }),
  ),
);

export default () => new Promise(resolve => {
  localforage.getItem('APP_STATE')
    .then(res => {
      resolve(
        createStore(reducer, res, enhancer)
      );
    }).catch(() => {
      resolve(
        createStore(reducer, enhancer)
      );
    });
});
