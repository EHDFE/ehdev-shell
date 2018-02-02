import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';

import WindowManager from './WindowManager';

const render = (Component, store, persistor) => {
  ReactDOM.render(
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <div>
          <Component />
          <WindowManager />
        </div>
      </PersistGate>
    </Provider>,
    document.getElementById('root')
  );
};

export default render;
