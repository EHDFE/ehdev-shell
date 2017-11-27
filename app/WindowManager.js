import { remote } from 'electron';

import WindowControl from './components/component.windowControl/';

const setWindowClose = () => {
  const win = remote.getCurrentWindow();
  win.close();
};
const setWindowMinimize = () => {
  const win = remote.getCurrentWindow();
  win.minimize();
};
const setWindowFullscreen = () => {
  const win = remote.getCurrentWindow();
  const isFullScreen = win.isFullScreen();
  win.setFullScreen(!isFullScreen);
};

const WindowManager = () => (
  <WindowControl
    onRequestClose={setWindowClose}
    onRequestMinimize={setWindowMinimize}
    onRequestFullscreen={setWindowFullscreen}
  />
);

export default WindowManager;
