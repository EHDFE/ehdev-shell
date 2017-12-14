import { remote } from 'electron';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { actions } from './modules/module.layout/store';

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

const WindowManager = ({ previewMode, togglePreviewMode }) => (
  <WindowControl
    visibility={previewMode ? 'hidden' : 'visible'}
    onRequestClose={setWindowClose}
    onRequestMinimize={setWindowMinimize}
    onRequestFullscreen={setWindowFullscreen}
    onRequestToggleVisible={togglePreviewMode}
  />
);

WindowManager.propTypes = {
  previewMode: PropTypes.bool,
  togglePreviewMode: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    previewMode: state['page.wallpaper'].previewMode,
  };
};

const mapDispatchToProps = dispatch => ({
  togglePreviewMode: () => dispatch(actions.togglePreviewMode()),
});

export default connect(mapStateToProps, mapDispatchToProps)(WindowManager);
