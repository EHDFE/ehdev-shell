/**
 * @author ryan.bian
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import App from './App';
import render from './run';
import store from './configureStore';

render(App, store);

if (module.hot) {
  module.hot.accept('./App', () => {
    render(App, store);
  });
}
