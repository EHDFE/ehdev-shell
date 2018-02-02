/**
 * Profile of project
 * @author ryan.bian
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';

import styles from './profile.less';

const Profile = (props) => {
  const {
    rootPath,
    name,
    version,
    author,
    description,
    isGitProject,
    isSvnProject,
  } = props;
  const items = [
    <div key="rootPath" className={styles.Profile__Item}>
      <div className={styles.Profile__ItemLabel}>
        <Icon type="home" />根目录
      </div>
      <div className={styles.Profile__ItemContent}>{rootPath}</div>
    </div>
  ];
  if (isSvnProject || isGitProject) {
    items.push(
      <div key="scm" className={styles.Profile__Item}>
        <div className={styles.Profile__ItemLabel}>
          <Icon type="fork" />版本管理
        </div>
        <div className={styles.Profile__ItemContent}>
          {isSvnProject && 'svn'}
          {isGitProject && 'git'}
        </div>
      </div>
    );
  }
  if (name) {
    items.push(
      <div key="name" className={styles.Profile__Item}>
        <div className={styles.Profile__ItemLabel}>
          <Icon type="book" />项目名称
        </div>
        <div className={styles.Profile__ItemContent}>{name}</div>
      </div>
    );
  }
  if (version) {
    items.push(
      <div key="version" className={styles.Profile__Item}>
        <div className={styles.Profile__ItemLabel}>
          <Icon type="tag-o" />版本号
        </div>
        <div className={styles.Profile__ItemContent}>{version}</div>
      </div>
    );
  }
  if (author) {
    items.push(
      <div key="author" className={styles.Profile__Item}>
        <div className={styles.Profile__ItemLabel}>
          <Icon type="user" />作者
        </div>
        <div className={styles.Profile__ItemContent}>{author}</div>
      </div>
    );
  }
  if (description) {
    items.push(
      <div key="description" className={styles.Profile__Item}>
        <div className={styles.Profile__ItemLabel}>
          <Icon type="profile" />描述
        </div>
        <div className={styles.Profile__ItemContent}>{description}</div>
      </div>
    );
  }
  return (
    <section className={styles.Profile}>
      { items }
    </section>
  );
};

PropTypes.defaultProps = {
  rootPath: '',
  name: '',
  version: '',
  description: '',
  author: '',
  isGitProject: false,
  isSvnProject: false,
};

Profile.propTypes = {
  rootPath: PropTypes.string,
  name: PropTypes.string,
  version: PropTypes.string,
  description: PropTypes.string,
  author: PropTypes.string,
  isGitProject: PropTypes.bool,
  isSvnProject: PropTypes.bool,
};

export default Profile;
