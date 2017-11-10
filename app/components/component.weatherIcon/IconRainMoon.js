/**
 * Rain Moon Icon
 * @author ryan.bian
 */
import React from 'react';
import classnames from 'classnames';

import styles from './index.less';

const IconRainMoon = () => (
  <svg
    version="1.1"
    id="cloudDrizzleMoon"
    className={classnames(styles.climacon, styles['climacon_cloudDrizzleMoon'])}
    viewBox="15 15 70 70"
  >
    <clipPath id="moonCloudFillClip">
      <path d="M0,0v100h100V0H0z M60.943,46.641c-4.418,0-7.999-3.582-7.999-7.999c0-3.803,2.655-6.979,6.211-7.792c0.903,4.854,4.726,8.676,9.579,9.58C67.922,43.986,64.745,46.641,60.943,46.641z" />
    </clipPath>
    <clipPath id="cloudFillClip">
      <path d="M15,15v70h70V15H15z M59.943,61.639c-3.02,0-12.381,0-15.999,0c-6.626,0-11.998-5.371-11.998-11.998c0-6.627,5.372-11.999,11.998-11.999c5.691,0,10.434,3.974,11.665,9.29c1.252-0.81,2.733-1.291,4.334-1.291c4.418,0,8,3.582,8,8C67.943,58.057,64.361,61.639,59.943,61.639z" />
    </clipPath>
    <g
      className={classnames(
        styles.climacon_iconWrap,
        styles['climacon_iconWrap-cloudDrizzleMoon']
      )}
    >
      <g clipPath="url(#cloudFillClip)">
        <g
          className={classnames(
            styles.climacon_wrapperComponent,
            styles['climacon_wrapperComponent-moon'],
            styles['climacon_componentWrap-moon_cloud']
          )}
          clipPath="url(#moonCloudFillClip)"
        >
          <path
            className={classnames(
              styles.climacon_component,
              styles['climacon_component-stroke'],
              styles['climacon_component-stroke_moon']
            )}
            d="M61.023,50.641c-6.627,0-11.999-5.372-11.999-11.998c0-6.627,5.372-11.999,11.999-11.999c0.755,0,1.491,0.078,2.207,0.212c-0.132,0.576-0.208,1.173-0.208,1.788c0,4.418,3.582,7.999,8,7.999c0.614,0,1.212-0.076,1.788-0.208c0.133,0.717,0.211,1.452,0.211,2.208C73.021,45.269,67.649,50.641,61.023,50.641z"
          />
        </g>
      </g>
      <g
        className={classnames(
          styles.climacon_wrapperComponent,
          styles['climacon_wrapperComponent-drizzle']
        )}
      >
        <path
          className={classnames(
            styles.climacon_component,
            styles['climacon_component-stroke'],
            styles['climacon_component-stroke_drizzle'],
            styles['climacon_component-stroke_drizzle-left']
          )}
          d="M42.001,53.644c1.104,0,2,0.896,2,2v3.998c0,1.105-0.896,2-2,2c-1.105,0-2.001-0.895-2.001-2v-3.998C40,54.538,40.896,53.644,42.001,53.644z"
        />
        <path
          className={classnames(
            styles.climacon_component,
            styles['climacon_component-stroke'],
            styles['climacon_component-stroke_drizzle'],
            styles['climacon_component-stroke_drizzle-middle']
          )}
          d="M49.999,53.644c1.104,0,2,0.896,2,2v4c0,1.104-0.896,2-2,2s-1.998-0.896-1.998-2v-4C48.001,54.54,48.896,53.644,49.999,53.644z"
        />
        <path
          className={classnames(
            styles.climacon_component,
            styles['climacon_component-stroke'],
            styles['climacon_component-stroke_drizzle'],
            styles['climacon_component-stroke_drizzle-right']
          )}
          d="M57.999,53.644c1.104,0,2,0.896,2,2v3.998c0,1.105-0.896,2-2,2c-1.105,0-2-0.895-2-2v-3.998C55.999,54.538,56.894,53.644,57.999,53.644z"
        />
      </g>
      <g
        className={classnames(
          styles.climacon_wrapperComponent,
          styles['climacon_wrapperComponent-cloud']
        )}
        clipPath="url(#cloudFillClip)"
      >
        <path
          className={classnames(
            styles.climacon_component,
            styles['climacon_component-stroke'],
            styles['climacon_component-stroke_cloud']
          )}
          d="M63.999,64.944v-4.381c2.387-1.386,3.998-3.961,3.998-6.92c0-4.418-3.58-8-7.998-8c-1.603,0-3.084,0.481-4.334,1.291c-1.232-5.316-5.973-9.29-11.664-9.29c-6.628,0-11.999,5.372-11.999,12c0,3.549,1.55,6.729,3.998,8.926v4.914c-4.776-2.769-7.998-7.922-7.998-13.84c0-8.836,7.162-15.999,15.999-15.999c6.004,0,11.229,3.312,13.965,8.203c0.664-0.113,1.336-0.205,2.033-0.205c6.627,0,11.998,5.373,11.998,12C71.997,58.864,68.655,63.296,63.999,64.944z"
        />
      </g>
    </g>
  </svg>
);

export default IconRainMoon;
