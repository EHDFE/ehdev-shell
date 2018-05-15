import { ipcRenderer, remote } from 'electron';
// import PropTypes from 'prop-types';
import WindowControl from './components/component.windowControl/';
// import { notification } from 'antd';

const setWindowClose = () => {
  // const win = remote.getCurrentWindow();
  // win.close();
  remote.app.quit();
};
const setWindowMinimize = () => {
  const win = remote.getCurrentWindow();
  win.hide();
};
const setWindowMaximize = () => {
  const win = remote.getCurrentWindow();
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
};

ipcRenderer.on('update-download-progress', (e, msg) => {
  // console.log(msg);
  // notification.info({
  //   duration: false,
  //   key: 'id',
  //   message: '下载更新',
  //   description: msg,
  //   onClose() {
  //     return false;
  //   }
  // });
});

const WindowManager = () => (
  <WindowControl
    onRequestClose={setWindowClose}
    onRequestMinimize={setWindowMinimize}
    onRequestMaximize={setWindowMaximize}
  />
);

WindowManager.propTypes = {
};

export default WindowManager;
