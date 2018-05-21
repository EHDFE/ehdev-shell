import Raven from 'raven-js';
import { RAVEN_ID } from '../CONFIG';
import pkg from '../package.json';

const reporter = (store, starter) => {
  const state = store.getState();
  const userConfig = state['page.user'];
  Raven.config(RAVEN_ID, {
    release: pkg.version,
    environment: process.env.NODE_ENV,
  }).install();
  if (userConfig.size > 0) {
    Raven.setUserContext({
      id: userConfig.get('name', 'anonymous'),
    });
  }
  Raven.context(() => {
    starter();
  });
};

export default reporter;
