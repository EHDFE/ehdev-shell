import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';

import DevTools from './DevTools';
import WindowManager from './WindowManager';

const render = (Component, store, persistor) => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <div>
            <Component />
            <WindowManager />
            <DevTools />
          </div>
        </PersistGate>
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  );
};

export default render;
