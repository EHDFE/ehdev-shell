import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

const render = (Component, store) => {
  ReactDOM.render(
    <Provider store={store}>
      <Component store={store} />
    </Provider>,
    document.getElementById('root')
  );
}

export default render;
