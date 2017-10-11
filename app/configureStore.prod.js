import { applyMiddleware, createStore, compose } from 'redux';
import promiseMiddleware from 'redux-promise';

import reducer from './reducer';

const enhancer = compose(
  applyMiddleware(promiseMiddleware)
);

export default createStore(reducer, enhancer);
