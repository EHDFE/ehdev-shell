/**
 * Layout Component
 * @author ryan.bian
 */
import PropTypes from 'prop-types';
import { Layout, Icon } from 'antd';
import { platform } from 'os';
const PLATFORM = platform();

import styles from './index.less';

const LayoutComponent = ({ title, icon, hasContent = true, children }) => {
  const header = title ? (
    <header className={styles.Layout__Header}>
      <Icon
        className={styles.Layout__HeaderIcon}
        type={icon}
        style={{
          fontSize: 36,
        }}
      />
      <h1 className={styles.Layout__HeaderTitle}>{title}</h1>
    </header>
  ) : null;

  const content = hasContent ? (
    <div className={styles.Layout__Content}>
      { children }
    </div>
  ) : children;

  return (
    <Layout className={PLATFORM}>
      <main className={styles.Layout}>
        { header }
        { content }
      </main>
    </Layout>
  );
};

LayoutComponent.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.string,
  hasContent: PropTypes.bool,
  children: PropTypes.any,
};

export default LayoutComponent;
