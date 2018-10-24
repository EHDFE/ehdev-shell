/**
 * Moon Icon
 * @author ryan.bian
 */
import React from 'react';
import classnames from 'classnames';

import styles from './index.less';

const IconMoon = () => (
  <svg
    version="1.1"
    id="moon"
    className={classnames(styles.climacon, styles.climacon_moon)}
    viewBox="15 15 70 70"
  >
    <clipPath id="moonFillClip">
      <path d="M15,15v70h70V15H15z M50,57.999c-4.418,0-7.999-3.582-7.999-7.999c0-3.803,2.655-6.979,6.211-7.792c0.903,4.854,4.726,8.676,9.579,9.58C56.979,55.344,53.802,57.999,50,57.999z" />
    </clipPath>
    <g
      className={classnames(
        styles.climacon_iconWrap,
        styles['climacon_iconWrap-moon'],
      )}
    >
      <g
        className={classnames(
          styles.climacon_componentWrap,
          styles['climacon_componentWrap-moon'],
        )}
        clipPath="url(#moonFillClip)"
      >
        <path
          className={classnames(
            styles.climacon_component,
            styles['climacon_component-stroke'],
            styles['climacon_component-stroke_moon'],
          )}
          d="M50,61.998c-6.627,0-11.999-5.372-11.999-11.998c0-6.627,5.372-11.999,11.999-11.999c0.755,0,1.491,0.078,2.207,0.212c-0.132,0.576-0.208,1.173-0.208,1.788c0,4.418,3.582,7.999,8,7.999c0.614,0,1.212-0.076,1.788-0.208c0.133,0.717,0.211,1.452,0.211,2.208C61.998,56.626,56.626,61.998,50,61.998z"
        />
      </g>
    </g>
  </svg>
);

export default IconMoon;
