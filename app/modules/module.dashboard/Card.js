/**
 * Card Component
 * @author ryan.bian
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from './index.less';

const Card = ({ className, title, children }) => (
  <section className={classnames(styles.Card, className)}>
    {title ? <h3 className={styles.Card__Title}>{title}</h3> : null}
    {children}
  </section>
);

Card.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.any,
};

export default Card;
