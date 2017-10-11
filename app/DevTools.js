/**
 * devtool for redux
 * @author ryan.bian
 */
import React from 'react';
import { createDevTools } from 'redux-devtools';

import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';
import Dispatcher from 'redux-devtools-dispatch';

const actionCreators = {
};

// <LogMonitor />
const DevTools = createDevTools(
  <DockMonitor
    toggleVisibilityKey={'ctrl-h'}
    changePositionKey={'ctrl-p'}
    changeMonitorKey={'ctrl-m'}
    defaultIsVisible={false}
  >
  <Dispatcher actionCreators={actionCreators} />
  </DockMonitor>
);

export default DevTools;
