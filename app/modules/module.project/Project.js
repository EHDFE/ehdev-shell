/**
 * Project Module
 * @author ryan.bian
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import classnames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Tabs, Spin, Card, Icon } from 'antd';

import { actions } from './store';

import styles from './index.less';

import Page from '../../components/component.page/';
import FolderPicker from '../../components/component.folderPicker/';
import DependencyManager from '../../components/component.dependencyManager/';
// import EslintResult from '../../components/component.eslint.result/';

import Profile from './partialComponent/Profile';
import Setup from './partialComponent/Setup';
import RuntimeConfigModal from './partialComponent/RuntimeConfigModal';
import ProjectAction from './partialComponent/Action';

const { TabPane } = Tabs;

class ProjectModule extends PureComponent {
  static defaultProps = {
    runtimeConfig: {
      port: 3000,
    },
  }
  static propTypes = {
    rootPath: PropTypes.string,
    prevRootPath: PropTypes.string,
    pkg: PropTypes.object,
    runnable: PropTypes.bool,
    useESlint: PropTypes.bool,
    lintResult: PropTypes.array,
    config: PropTypes.object,
    pids: PropTypes.array,
    currentServiceList: PropTypes.arrayOf(PropTypes.shape({
      pid: PropTypes.number.isRequired,
      rootPath: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['server', 'builder']),
    })),
    runtimeConfig: PropTypes.shape({
      port: PropTypes.number,
    }).isRequired,
    getEnvData: PropTypes.func,
    setEnvData: PropTypes.func,
    setRootPath: PropTypes.func,
    startServer: PropTypes.func,
    stopServer: PropTypes.func,
    startBuilder: PropTypes.func,
    stopBuilder: PropTypes.func,
    getOutdated: PropTypes.func,
    getPkgInfo: PropTypes.func,
    // getESlintResult: PropTypes.func,
    updateRuntimeConfig: PropTypes.func,
    pkgInfo: PropTypes.object,
  }
  state = {
    defaultActiveKey: 'profile',
    loading: false,
    runtimeConfigerVisible: false,
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
  getInitData = hasLoading => {
    if (hasLoading) {
      this.setState({
        loading: true
      });
    }
    const { rootPath } = this.props;
    if (rootPath) {
      return Promise.all([
        this.props.getEnvData(rootPath),
        this.props.getPkgInfo(rootPath),
      ]).then(()=> {
        if (hasLoading) {
          this.setState({
            loading: false
          });
        }
      });
    }
    return Promise.resolve();
  }
  handleStartServer = () => {
    const { pkg, config, runtimeConfig } = this.props;
    this.props.startServer({
      root: this.props.rootPath,
      port: runtimeConfig.port,
      projectName: pkg.name,
      configerName: `ehdev-configer-${config.type}`,
      runtimeConfig,
    });
  }
  handleStartBuilder = () => {
    const { pkg, config } = this.props;
    this.props.startBuilder({
      root: this.props.rootPath,
      projectName: pkg.name,
      configerName: `ehdev-configer-${config.type}`,
    });
  }
  handleStartDllBuilder = () => {
    const { pkg, config } = this.props;
    this.props.startBuilder({
      root: this.props.rootPath,
      projectName: pkg.name,
      configerName: `ehdev-configer-${config.type}`,
      isDll: true,
    });
  }
  handleStopService = (type, pid) => {
    const { pkg } = this.props;
    if (type === 'server') {
      this.props.stopServer(pid, false, {
        projectName: pkg.name,
      });
    } else if (type === 'builder') {
      this.props.stopBuilder(pid, false, {
        projectName: pkg.name,
      });
    }
  }
  handleUpdateConfig = config => {
    const { rootPath } = this.props;
    const configs = { rootPath, ...config };
    this.props.setEnvData(configs, rootPath);
  }
  // handleUpdateEslint = () => {
  //   const { rootPath } = this.props;
  //   this.props.getESlintResult(rootPath);
  // }
  hanleCloseRuntimeConfiger = configData => {
    if (configData) {
      this.props.updateRuntimeConfig(configData);
    }
    this.setState({
      runtimeConfigerVisible: false,
    });
  }
  showRuntimeConfiger = () => {
    this.setState({
      runtimeConfigerVisible: true,
    });
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
    const  { pkgInfo, pkg, rootPath } = this.props;
    const props = {
      pkgInfo,
      pkg,
      rootPath,
      refresh: this.getInitData,
    };
    return <DependencyManager {...props} />;
  }
  renderActionBar() {
    const { currentServiceList, runnable, config } = this.props;
    const props = {
      runningServer: currentServiceList.find(d => d.type === 'server'),
      runningBuilder: currentServiceList.find(d => d.type === 'builder'),
      runnable,
      dllEnable: config && config.dll && config.dll.enable,
      getInitData: this.getInitData,
      handleStartServer: this.handleStartServer,
      handleStartBuilder: this.handleStartBuilder,
      handleStopService: this.handleStopService,
      handleStartDllBuilder: this.handleStartDllBuilder,
      onClickRuntimeConfiger: this.showRuntimeConfiger,
    };
    return <ProjectAction {...props} />;
  }
  // renderLintResult() {
  //   const { rootPath, lintResult } = this.props;
  //   return <EslintResult rootPath={rootPath} data={lintResult} />;
  // }
  tabKey = (key) => {
    this.setState({
      defaultActiveKey: key
    });
  }
  render() {
    const { rootPath, prevRootPath, runnable, setRootPath, pkg, runtimeConfig } = this.props;
    const { runtimeConfigerVisible } = this.state;
    const runtimeConfigerProps = {
      visible: runtimeConfigerVisible,
      close: this.hanleCloseRuntimeConfiger,
      closeWithData: this.hanleCloseRuntimeConfiger,
      formData: runtimeConfig,
    };
    // {
    //   useESlint ?
    //     <TabPane
    //       tab={
    //         [
    //           '代码质量',
    //           <button
    //             className={styles.Project__EslintBtn}
    //             onClick={this.handleUpdateEslint}
    //             key="refresh"
    //           >
    //             <Icon type="reload" />
    //           </button>,
    //         ]
    //       }
    //       key="eslint"
    //     >
    //       { this.renderLintResult() }
    //     </TabPane> :
    //     null
    // }
    return (
      <Page>
        <div className={styles.Project__Layout}>
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
          <Spin className={styles.Project__ContentSpin} spinning={this.state.loading}>
            <Tabs defaultActiveKey={this.state.defaultActiveKey} onChange={this.tabKey} animated={false}>
              <TabPane tab="基础信息" key="profile">
                <div className={styles.Project__TabContent}>
                  { this.renderProfile() }
                </div>
              </TabPane>
              { runnable ? <TabPane tab="运行配置" key="config">
                <div className={styles.Project__TabContent}>
                  { this.renderSetup() }
                </div>
              </TabPane> : null }
              <TabPane tab="依赖管理" key="versions">
                <div className={styles.Project__TabContent}>
                  { this.renderPackageVersions() }
                </div>
              </TabPane>
            </Tabs>
          </Spin>
          <RuntimeConfigModal {...runtimeConfigerProps} />
        </div>
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
  pageState => ({
    pids: pageState.service.pids || [],
    instancesList: pageState.service.instances ? Object.values(pageState.service.instances) : [],
  }),
);

const mapStateToProps = (state) => createSelector(
  envSelector,
  serviceSelector,
  (env, service) => ({
    ...env,
    pids: service.pids || [],
    currentServiceList: service.instancesList.filter(d => env.rootPath === d.rootPath),
  }),
);
const mapDispatchToProps = dispatch => ({
  setRootPath: rootPath => dispatch(actions.env.setRootPath(rootPath)),
  getEnvData: rootPath => dispatch(actions.env.getEnv(rootPath)),
  setEnvData: (config, rootPath) => dispatch(actions.env.setEnv(config, rootPath, dispatch)),
  startServer: params => dispatch(actions.service.startServer(params, dispatch)),
  stopServer: (...args) => dispatch(actions.service.stopServer(...args)),
  startBuilder: params => dispatch(actions.service.startBuilder(params, dispatch)),
  stopBuilder: (...args) => dispatch(actions.service.stopBuilder(...args)),
  getOutdated: packageName => dispatch(actions.env.getOutdated(packageName)),
  getPkgInfo: rootPath => dispatch(actions.env.getPkginfo(rootPath)),
  // getESlintResult: rootPath => dispatch(actions.env.getLintResult(rootPath)),
  updateRuntimeConfig: config => dispatch(actions.env.updateRuntimeConfig(config)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectModule);
