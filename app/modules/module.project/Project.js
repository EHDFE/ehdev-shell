/**
 * Project Module
 * @author ryan.bian
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import classnames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Tabs, Layout, Menu, Dropdown, Spin, Card, Icon } from 'antd';
import IconPlay from 'react-icons/lib/fa/play-circle-o';
import IconStop from 'react-icons/lib/fa/stop-circle-o';
import IconBuild from 'react-icons/lib/fa/codepen';
import MdAutorenew from 'react-icons/lib/md/autorenew';

import { actions } from './store';

import styles from './index.less';

import Page from '../../components/component.page/';
import FolderPicker from '../../components/component.folderPicker/';
import DependencyManager from '../../components/component.dependencyManager/';
import EslintResult from '../../components/component.eslint.result/';

import Profile from './Profile';
import Setup from './Setup';

const { TabPane } = Tabs;
const { Content } = Layout;

class ProjectModule extends PureComponent {
  static propTypes = {
    rootPath: PropTypes.string,
    prevRootPath: PropTypes.string,
    pkg: PropTypes.object,
    runnable: PropTypes.bool,
    useESlint: PropTypes.bool,
    lintResult: PropTypes.array,
    config: PropTypes.object,
    service: PropTypes.object,
    getEnvData: PropTypes.func,
    setEnvData: PropTypes.func,
    setRootPath: PropTypes.func,
    startServer: PropTypes.func,
    stopServer: PropTypes.func,
    startBuilder: PropTypes.func,
    stopBuilder: PropTypes.func,
    getOutdated: PropTypes.func,
    getPkgInfo: PropTypes.func,
    getESlintResult: PropTypes.func,
  }
  state = {
    defaultActiveKey: 'profile',
    loading: false
  }
  componentDidMount() {
    this.getInitData();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.rootPath && (nextProps.rootPath !== this.props.rootPath)) {
      this.props.getEnvData(nextProps.rootPath);
      this.props.getPkgInfo(nextProps.rootPath);
    }
  }
  getInitData = (tag) => {
    if (tag) {
      this.setState({
        loading: true
      });
    }
    const { rootPath } = this.props;
    if (rootPath) {
      Promise.all([
        this.props.getEnvData(rootPath),
        this.props.getPkgInfo(rootPath),
      ]).then(()=> {
        if (tag) {
          this.setState({
            loading: false
          });
        }
      });
    }
  }
  handleStartServer = () => {
    const { config } = this.props;
    this.props.startServer({
      root: this.props.rootPath,
      port: 3000,
      configerName: `ehdev-configer-${config.type}`,
    });
  }
  handleStartBuilder = () => {
    const { config } = this.props;
    this.props.startBuilder({
      root: this.props.rootPath,
      configerName: `ehdev-configer-${config.type}`,
    });
  }
  handleStartDllBuilder = () => {
    const { config } = this.props;
    this.props.startBuilder({
      root: this.props.rootPath,
      configerName: `ehdev-configer-${config.type}`,
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
  handleUpdateConfig = config => {
    const { rootPath } = this.props;
    const configs = { rootPath, ...config };
    this.props.setEnvData(configs, rootPath);
  }
  handleUpdateEslint = () => {
    const { rootPath } = this.props;
    this.props.getESlintResult(rootPath);
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
  renderSetup() {
    const { config } = this.props;
    const setupProps = {};
    if (config) {
      Object.assign(setupProps,
        {
          config,
          onSubmit: this.handleUpdateConfig,
        },
      );
      return <Setup {...setupProps}></Setup>;
    }
    return <Card style={{ textAlign: 'center' }} bordered={false}>没有找到运行配置</Card>;
  }
  renderPackageVersions() {
    return <DependencyManager refresh={this.getInitData} {...this.props}/>;
  }
  renderActionBar() {
    const { service, runnable, config } = this.props;
    let actions;
    let buildButton = (
      <button
        className={styles.Project__ActionBarButton}
        key={'start-build'}
        disabled={!!service.pid}
        onClick={this.handleStartBuilder}
      >
        <IconBuild size={22} />
        构建
      </button>
    );
    let refreshButton = (
      <button
        className={styles.Project__ActionBarButton}
        key={'update'}
        onClick={()=>{this.getInitData('refresh');}}
      >
        <MdAutorenew size={22} />
          刷新
      </button>
    );
    if (runnable) {
      if (config && config.dll && config.dll.enable) {
        buildButton = (
          <Dropdown key="start-build" overlay={
            <Menu>
              <Menu.Item>
                <button
                  className={styles['Project__ActionBarButton--trigger']}
                  key={'start-dll-build'}
                  disabled={!!service.pid}
                  onClick={this.handleStartDllBuilder}
                >
                  DLL构建
                </button>
              </Menu.Item>
            </Menu>
          }>
            {buildButton}
          </Dropdown>
        );
      }
      actions = [
        <button
          className={styles.Project__ActionBarButton}
          key={'start-server'}
          disabled={!!service.pid}
          onClick={this.handleStartServer}
        >
          <IconPlay size={22} />
          启动
        </button>,
        buildButton,
        <button
          className={styles.Project__ActionBarButton}
          key={'stop'}
          disabled={!service.pid}
          onClick={this.handleStopService}
        >
          <IconStop size={22} />
          停止
        </button>,
        refreshButton,
      ];
    } else {
      actions = [
        refreshButton
      ];
    }
    return <div className={styles.Project__ActionBar}>{actions}</div>;
  }
  renderLintResult() {
    const { rootPath, lintResult } = this.props;
    return <EslintResult rootPath={rootPath} data={lintResult} />;
  }
  tabKey = (key) => {
    this.setState({
      defaultActiveKey: key
    });
  }
  render() {
    const { rootPath, prevRootPath, runnable, useESlint, setRootPath, pkg } = this.props;
    return (
      <Page>
        <Layout className={styles.Project__Layout}>
          <Content>
            <div className={styles.Project__TopBar}>
              <FolderPicker
                onChange={value => {
                  setRootPath(value);
                }}
                prevValue={prevRootPath}
                value={rootPath}
              >
                <h3 className={styles.Project__ProjectName}>
                  { pkg && pkg.name || '请选择项目' }
                  <Icon type="setting" className={styles.Project__ProjectNameIcon} />
                </h3>
              </FolderPicker>
              { this.renderActionBar() }
            </div>
            <Spin spinning={this.state.loading}>
              <Tabs defaultActiveKey={this.state.defaultActiveKey} onChange={this.tabKey} animated={false}>
                <TabPane tab="基础信息" key="profile">
                  { this.renderProfile() }
                </TabPane>
                {
                  useESlint ?
                    <TabPane
                      tab={
                        [
                          '代码质量',
                          <button
                            className={styles.Project__EslintBtn}
                            onClick={this.handleUpdateEslint}
                            key="refresh"
                          >
                            <Icon type="reload" />
                          </button>,
                        ]
                      }
                      key="eslint"
                    >
                      { this.renderLintResult() }
                    </TabPane> :
                    null
                }
                { runnable ? <TabPane tab="运行配置" key="config">
                  { this.renderSetup() }
                </TabPane> : null }
                <TabPane tab="依赖管理" key="versions">
                  { this.renderPackageVersions() }
                </TabPane>
              </Tabs>
            </Spin>
          </Content>
        </Layout>
      </Page>
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
  setEnvData: (config, rootPath) => dispatch(actions.env.setEnv(config, rootPath, dispatch)),
  startServer: params => dispatch(actions.service.startServer(params, dispatch)),
  stopServer: pid => dispatch(actions.service.stopServer(pid)),
  startBuilder: params => dispatch(actions.service.startBuilder(params, dispatch)),
  stopBuilder: pid => dispatch(actions.service.stopBuilder(pid)),
  getOutdated: packageName => dispatch(actions.env.getOutdated(packageName)),
  getPkgInfo: rootPath => dispatch(actions.env.getPkginfo(rootPath)),
  getESlintResult: rootPath => dispatch(actions.env.getLintResult(rootPath))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectModule);
