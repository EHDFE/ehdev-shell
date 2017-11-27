import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import WindowManager from './WindowManager';

const render = (Component, store) => {
  ReactDOM.render(
    <Provider store={store}>
      <div>
        <Component />
        <WindowManager />
      </div>
    </Provider>,
    document.getElementById('root')
  );
};

export default render;
