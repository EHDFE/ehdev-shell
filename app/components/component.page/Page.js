/**
 * Page Component
 * @author ryan.bian
 */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';

const Page = ({children}) => (
  <div className={styles.Page}>
    { children }
  </div>
);

Page.propTypes = {
  children: PropTypes.any,
};

export default Page;
