import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';

import DevTools from './DevTools';
import WindowManager from './WindowManager';

const render = (Component, store) => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <div>
          <WindowManager />
          <Component />
          <DevTools />
        </div>
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  );
};

export default render;
