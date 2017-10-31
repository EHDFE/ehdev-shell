/**
 * Project Module
 * @author ryan.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Button, Tabs, Layout } from 'antd';
import MdPlayCircle from 'react-icons/lib/md/play-circle-filled';
import MdPauseCircle from 'react-icons/lib/md/pause-circle-filled';

import { actions } from './store';

import styles from './index.less';

import FolderPicker from '../../components/component.folderPicker/';
import DependencyManager from '../../components/component.dependencyManager/';

import Profile from './Profile';
import Setup from './Setup';

const { TabPane } = Tabs;
const { Sider, Content } = Layout;

class ProjectModule extends Component {
  propTypes = {
    rootPath: PropTypes.string,
    pkg: PropTypes.object,
    config:PropTypes.object,
    service: PropTypes.object,
    getEnvData: PropTypes.func,
    setEnvData:PropTypes.func,
    setRootPath: PropTypes.func,
    startServer: PropTypes.func,
    stopServer: PropTypes.func,
    startBuilder: PropTypes.func,
    stopBuilder: PropTypes.func,
    getOutdated: PropTypes.func,
  }
  componentDidMount() {
    const { rootPath } = this.props;
    if (rootPath) {
      this.props.getEnvData(rootPath);
    }
    this.props.getOutdated();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.rootPath && (nextProps.rootPath !== this.props.rootPath)) {
      this.props.getEnvData(nextProps.rootPath);
    }
  }
  handleStartServer = () => {
    this.props.startServer({
      root: this.props.rootPath,
      port: 3000,
      configerName: 'ehdev-configer-spa',
    });
  }
  handleStartBuilder = () => {
    this.props.startBuilder({
      root: this.props.rootPath,
      configerName: 'ehdev-configer-spa',
    });
  }
  handleStartDllBuilder = () => {
    this.props.startBuilder({
      root: this.props.rootPath,
      configerName: 'ehdev-configer-spa',
      isDll: true,
    });
  }
  handleStopService = () => {
    const { runningService, pid } = this.props.service;
    if (runningService === 'server') {
      this.props.stopServer(pid);
    } else if (runningService === 'builder') {
      this.props.stopBuilder(pid);
    }
  }
  handleUpdateConfig = (config)=>{
    const {rootPath} = this.props;
    const configs = {rootPath,...config};
    this.props.setEnvData(configs);
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
  renderSetup(){
    const {config} = this.props;
    const setupProps = {};
    if(config){
      Object.assign(setupProps,
        {
          config,
          onSubmit:this.handleUpdateConfig
        },
      );
    }
    return <Setup {...setupProps}></Setup>;
  }
  renderActionBar() {
    const { service, config } = this.props;
    const actions = [
      <Button
        key={'start-server'}
        disabled={!!service.pid}
        onClick={this.handleStartServer}
      >
        <MdPlayCircle size={22} />
        启动开发环境
      </Button>,
      <Button
        key={'start-build'}
        disabled={!!service.pid}
        onClick={this.handleStartBuilder}
      >
        <MdPlayCircle size={22} />
        开始构建
      </Button>,
      <Button
        key={'stop'}
        disabled={!service.pid}
        onClick={this.handleStopService}
      >
        <MdPauseCircle size={22} />
        停止
      </Button>,
    ];
    if (config.dll && config.dll.enable) {
      actions.splice(
        1,
        0,
        <Button
          key={'start-dll-build'}
          disabled={!!service.pid}
          onClick={this.handleStartDllBuilder}
        >
          <MdPlayCircle size={22} />
          构建DLL
        </Button>
      );
    }
    return <div className={styles.Project__ActionBar}>{actions}</div>;
  }
  render() {
    const { rootPath, setRootPath, service } = this.props;
    return (
      <Layout className={styles.Project__Layout}>
        <Sider style={{ backgroundColor: '#fff' }}>
          <FolderPicker
            onChange={value => {
              setRootPath(value);
            }}
            value={rootPath}
          />
          <DependencyManager  rootPath={ this.props.rootPath }/>
        </Sider>
        <Content>
          { this.renderActionBar() }
          <Tabs defaultActiveKey="profile" animated={false}>
            <TabPane tab="基础信息" key="profile">
              { this.renderProfile() }
            </TabPane>
            <TabPane tab="运行配置" key="config">
              { this.renderSetup() }
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
const serviceSelector = createSelector(
  projectPageSelector,
  pageState => pageState.service,
);

const mapStateToProps = (state) => createSelector(
  envSelector,
  serviceSelector,
  (env, service) => ({
    ...env,
    service,
  }),
);
const mapDispatchToProps = dispatch => ({
  setRootPath: rootPath => dispatch(actions.env.setRootPath(rootPath)),
  getEnvData: rootPath => dispatch(actions.env.getEnv(rootPath)),
  setEnvData: config => dispatch(actions.env.setEnv(config)),
  startServer: params => dispatch(actions.service.startServer(params, dispatch)),
  stopServer: pid => dispatch(actions.service.stopServer(pid)),
  startBuilder: params => dispatch(actions.service.startBuilder(params, dispatch)),
  stopBuilder: pid => dispatch(actions.service.stopBuilder(pid)),
  getOutdated: packageName => dispatch(actions.env.getOutdated(packageName))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectModule);
