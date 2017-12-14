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
import RemoveContentIcon from 'react-icons/lib/md/visibility-off';
import ShowContentIcon from 'react-icons/lib/md/visibility';

const IconProps = {
  size: 28
};

const WindowControl = ({
  visibility,
  onRequestClose,
  onRequestMinimize,
  onRequestFullscreen,
  onRequestToggleVisible,
}) => {
  return (
    <div className={styles.WindowControl}>
      <button
        className={classnames(
          styles.WindowControl__Button,
          styles['WindowControl__Button--minimize']
        )}
        onClick={onRequestToggleVisible}
      >
        {
          visibility === 'visible' ?
            <RemoveContentIcon {...IconProps} /> :
            <ShowContentIcon {...IconProps} />
        }
      </button>
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

WindowControl.defaultProps = {
  visibility: 'visible',
};

WindowControl.propTypes = {
  visibility: PropTypes.oneOf(['visible', 'hidden']),
  onRequestClose: PropTypes.func,
  onRequestMinimize: PropTypes.func,
  onRequestFullscreen: PropTypes.func,
  onRequestToggleVisible: PropTypes.func,
};

export default WindowControl;
