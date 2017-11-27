/**
 * Window Control
 * @author ryan.bian
 */
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styles from './index.less';

import MinimizeIcon from 'react-icons/lib/ti/minus';
import FullscreenIcon from 'react-icons/lib/ti/media-stop-outline';
import CloseIcon from 'react-icons/lib/ti/times';

const IconProps = {
  size: 28
};

const WindowControl = ({
  onRequestClose,
  onRequestMinimize,
  onRequestFullscreen,
}) => {
  return (
    <div className={styles.WindowControl}>
      <button
        className={classnames(
          styles.WindowControl__Button,
          styles['WindowControl__Button--minimize']
        )}
        onClick={onRequestMinimize}
      >
        <MinimizeIcon {...IconProps} />
      </button>
      <button
        className={classnames(
          styles.WindowControl__Button,
          styles['WindowControl__Button--fullscreen']
        )}
        onClick={onRequestFullscreen}
      >
        <FullscreenIcon {...IconProps} />
      </button>
      <button
        className={classnames(
          styles.WindowControl__Button,
          styles['WindowControl__Button--close']
        )}
        onClick={onRequestClose}
      >
        <CloseIcon {...IconProps} />
      </button>
    </div>
  );
};

WindowControl.propTypes = {
  onRequestClose: PropTypes.func,
  onRequestMinimize: PropTypes.func,
  onRequestFullscreen: PropTypes.func,
};

export default WindowControl;
