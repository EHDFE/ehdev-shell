/**
 * Card Component
 * @author ryan.bian
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from './index.less';

const Card = ({ className, children }) => (
  <section className={classnames(
    styles.Card,
    className,
  )}>
    { children }
  </section>
);

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
};

export default Card;
