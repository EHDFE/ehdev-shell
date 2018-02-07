import { remote, shell } from 'electron';

let remoteAPI;
if (process.env.NODE_ENV === 'production') {
  remoteAPI = remote.require('./main-build/apiService');
} else {
  remoteAPI = remote.require('../src/apiService');
}

export default class NotificationManager {
  constructor() {
  }
  send(
    config,
    responser = () => {}
  ) {
    if (!config.title && !config.message) {
      // eslint-disable-next-line
      console.warn('[Notification] must have title or message!');
    }
    config = Object.assign(config, {
      sound: true,
      wait: true,
    });
    const {
      onClick,
      onTimeout,
      ...notifyConfig
    } = config;
    remoteAPI.providers.notification.notify(notifyConfig, responser, {
      onClick,
      onTimeout,
    });
  }
  openBrowser(address) {
    shell.openExternal(address);
  }
}
