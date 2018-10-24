/**
 * Window Control
 * @author ryan.bian
 */
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styles from './index.less';

import MinimizeIcon from 'react-icons/lib/md/remove';
import FullscreenIcon from 'react-icons/lib/md/crop-din';
import CloseIcon from 'react-icons/lib/md/close';

const IconProps = {
  size: 28,
};

const WindowControl = ({
  onRequestClose,
  onRequestMinimize,
  onRequestMaximize,
  // onRequestToggleVisible,
}) => {
  return (
    <div className={styles.WindowControl}>
      <button
        className={classnames(
          styles.WindowControl__Button,
          styles['WindowControl__Button--minimize'],
        )}
        onClick={onRequestMinimize}
      >
        <MinimizeIcon {...IconProps} />
      </button>
      <button
        className={classnames(
          styles.WindowControl__Button,
          styles['WindowControl__Button--fullscreen'],
        )}
        onClick={onRequestMaximize}
      >
        <FullscreenIcon {...IconProps} />
      </button>
      <button
        className={classnames(
          styles.WindowControl__Button,
          styles['WindowControl__Button--close'],
        )}
        onClick={onRequestClose}
      >
        <CloseIcon {...IconProps} />
      </button>
    </div>
  );
};

WindowControl.defaultProps = {};

WindowControl.propTypes = {
  onRequestClose: PropTypes.func,
  onRequestMinimize: PropTypes.func,
  onRequestMaximize: PropTypes.func,
  onRequestToggleVisible: PropTypes.func,
};

export default WindowControl;
