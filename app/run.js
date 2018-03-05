import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';

import DevTools from './DevTools';
import WindowManager from './WindowManager';

const render = (Component, store, persistor) => {
  const contents = [
    <Component key="component" />,
    <WindowManager key="windowManager" />,
  ];
  if (process.env.NODE_ENV === 'production') {
    contents.push(
      <DevTools key="devTool" />
    );
  }
  ReactDOM.render(
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        { contents }
      </PersistGate>
    </Provider>,
    document.getElementById('root')
  );
};

export default render;
