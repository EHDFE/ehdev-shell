/**
 * Project Module
 * @author ryan.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Tabs, Layout } from 'antd';

import { actions } from './store';

import styles from './index.less';

import FolderPicker from '../../components/component.folderPicker/';
import DependencyManager from '../../components/component.dependencyManager/';

import Profile from './Profile';

const { TabPane } = Tabs;
const { Sider, Content } = Layout;

class ProjectModule extends Component {
  propTypes = {
    rootPath: PropTypes.string,
    pkg: PropTypes.object,
    getEnvData: PropTypes.func,
    setRootPath: PropTypes.func,
    getOutdated: PropTypes.func,
  }
  componentDidMount() {
    const { rootPath } = this.props;
    if (rootPath) {
      this.props.getEnvData(rootPath);
    }
    this.props.getOutdated('koa');
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.rootPath && (nextProps.rootPath !== this.props.rootPath)) {
      this.props.getEnvData(nextProps.rootPath);
    }
  }
  renderProfile() {
    const { pkg } = this.props;
    const profileProps = {};
    if (pkg) {
      Object.assign(profileProps, {
        name: pkg.name,
        version: pkg.version,
        author: pkg.author,
        description: pkg.description,
      });
    }
    return <Profile {...profileProps} />;
  }
  render() {
    const { rootPath, setRootPath } = this.props;
    return (
      <Layout className={styles.Project__Layout}>
        <Sider style={{ backgroundColor: '#fff' }}>
          <FolderPicker
            onChange={value => {
              setRootPath(value);
            }}
            value={rootPath}
          />
          <DependencyManager />
        </Sider>
        <Content>
          <Tabs defaultActiveKey="profile" animated={false}>
            <TabPane tab="基础信息" key="profile">
              { this.renderProfile() }
            </TabPane>
            <TabPane tab="运行配置" key="config">
              运行配置xxx
            </TabPane>
            <TabPane tab="运行日志" key="logger">
              运行日志
            </TabPane>
          </Tabs>
        </Content>
      </Layout>
    );
  }
}

const projectPageSelector = state => state['page.project'];
const envSelector = createSelector(
  projectPageSelector,
  pageState => pageState.env,
);

const mapStateToProps = (state) => createSelector(
  envSelector,
  (env) => ({
    ...env,
  }),
);
const mapDispatchToProps = dispatch => ({
  setRootPath: rootPath => dispatch(actions.env.setRootPath(rootPath)),
  getEnvData: rootPath => dispatch(actions.env.getEnv(rootPath)),
  getOutdated: packageName => dispatch(actions.env.getOutdated(packageName))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectModule);
