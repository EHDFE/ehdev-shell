import { ipcRenderer, remote } from 'electron';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import WindowControl from './components/component.windowControl/';
// import { notification } from 'antd';
import { actions } from './modules/module.layout/store';


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

const WindowManager = ({ previewMode, togglePreviewMode }) => (
  <WindowControl
    visibility={previewMode ? 'hidden' : 'visible'}
    onRequestClose={setWindowClose}
    onRequestMinimize={setWindowMinimize}
    onRequestMaximize={setWindowMaximize}
    onRequestToggleVisible={togglePreviewMode}
  />
);

WindowManager.propTypes = {
  previewMode: PropTypes.bool,
  togglePreviewMode: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    previewMode: state.getIn(['page.wallpaper', 'previewMode']),
  };
};

const mapDispatchToProps = dispatch => ({
  togglePreviewMode: () => dispatch(actions.togglePreviewMode()),
});

export default connect(mapStateToProps, mapDispatchToProps)(WindowManager);
