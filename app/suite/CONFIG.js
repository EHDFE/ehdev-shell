const { platform } = require('os');
const isMac = platform() === 'darwin';

const CONFIG = {
  WIDTH: 900,
  HEIGHT: 600,
  MIN_WIDTH: 700,
  MIN_HEIGHT: 466,

  DEV_PORT: 1212,

  BROWSER_CONFIG: {
    // Enables scroll bounce (rubber banding) effect on macOS
    center: true,
    scrollBounce: true,
    frame: false,
    vibrancy: 'medium-light',
    titleBarStyle: isMac ? 'hidden' : 'default',
    transparent: isMac,
    webPreferences: {
      webSecurity: false,
      experimentalFeatures: true,
    },
  },
};

module.exports = CONFIG;
