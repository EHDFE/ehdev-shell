/**
 * Layout Component
 * @author ryan.bian
 */
import PropTypes from 'prop-types';
import { Layout, Icon } from 'antd';
import { platform } from 'os';
import classnames from 'classnames';

const PLATFORM = platform();

import styles from './index.less';

const LayoutComponent = ({ title, icon, children }) => {
  const header = title ? (
    <header className={styles.Layout__Header}>
      <Icon className={styles.Layout__HeaderIcon} type={icon} />
      <h1 className={styles.Layout__HeaderTitle}>{title}</h1>
    </header>
  ) : null;
  const content = <main className={styles.Layout__Content}>{children}</main>;

  return (
    <Layout className={classnames(PLATFORM, styles.Layout)}>
      {header}
      {content}
    </Layout>
  );
};

LayoutComponent.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.string,
  children: PropTypes.any,
};

export default LayoutComponent;
