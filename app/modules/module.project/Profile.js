/**
 * Profile of project
 * @author ryan.bian
 */
import React from 'react';
import PropTypes from 'prop-types';

import styles from './index.less';

const Profile = (props) => {
  const { name, version } = props;
  return (
    <div className={styles.Profile}>
      <h2 className={styles.Profile__title}>{ name }</h2>
      { version }
    </div>
  );
};

PropTypes.defaultProps = {
  name: '',
  version: '',
};

Profile.propTypes = {
  name: PropTypes.string,
  version: PropTypes.string,
};

export default Profile;
