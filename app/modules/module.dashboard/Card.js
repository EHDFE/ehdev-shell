/**
 * Card Component
 * @author ryan.bian
 */
import React from 'react';
import PropTypes from 'prop-types';

import styles from './index.less';

const Card = ({ children }) => (
  <section className={styles.Card}>
    { children }
  </section>
);

Card.propTypes = {
  children: PropTypes.any,
};

export default Card;
