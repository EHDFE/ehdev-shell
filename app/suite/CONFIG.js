const { platform } = require('os');
const isWin = platform() === 'win32';

const CONFIG = {
  WIDTH: 900,
  HEIGHT: 600,
  MIN_WIDTH: 700,
  MIN_HEIGHT: 466,

  DEV_PORT: 1212,

  BROWSER_CONFIG: {
    // Enables scroll bounce (rubber banding) effect on macOS
    scrollBounce: true,
    frame: false,
    vibrancy: 'medium-light',
    titleBarStyle: isWin ? 'default' : 'hidden',
    webPreferences: {
      webSecurity: false,
    },
  },
};

module.exports = CONFIG;
