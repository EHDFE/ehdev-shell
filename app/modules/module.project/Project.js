/**
 * Project Module
 * @author ryan.bian
 */
import { ipcRenderer } from 'electron';
import { Card, Icon, Spin, Tabs } from 'antd';
import { Map, Set } from 'immutable';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
// import classnames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import DependencyManager from '../../components/component.dependencyManager/';
import FolderPicker from '../../components/component.folderPicker/';
import Page from '../../components/component.page/';
import styles from './index.less';
import ProjectAction from './partialComponent/Action';
// import EslintResult from '../../components/component.eslint.result/';
import Profile from './partialComponent/Profile';
import RuntimeConfigModal from './partialComponent/RuntimeConfigModal';
import Setup from './partialComponent/Setup';
import { actions } from './store';
import { actions as consoleActions } from '../module.console/store';

const { TabPane } = Tabs;

class ProjectModule extends PureComponent {
  static defaultProps = {
    runtimeConfig: {
      port: 3000,
    },
  }
  static propTypes = {
    env: PropTypes.instanceOf(Map),
    // rootPath: PropTypes.string,
    // prevRootPath: PropTypes.string,
    // pkg: PropTypes.object,
    // runnable: PropTypes.bool,
    // useESlint: PropTypes.bool,
    // lintResult: PropTypes.array,
    // config: PropTypes.object,
    pids: PropTypes.instanceOf(Set),
    // scmInfo: PropTypes.shape({
    //   isGitProject: PropTypes.bool,
    //   isSvnProject: PropTypes.bool,
    // }),
    currentService: PropTypes.instanceOf(Map),
    // runtimeConfig: PropTypes.shape({
    //   port: PropTypes.number,
    // }).isRequired,
    getEnvData: PropTypes.func,
    setEnvData: PropTypes.func,
    setRootPath: PropTypes.func,
    setActive: PropTypes.func,
    startServer: PropTypes.func,
    stopServer: PropTypes.func,
    startBuilder: PropTypes.func,
    stopBuilder: PropTypes.func,
    getOutdated: PropTypes.func,
    getPkgInfo: PropTypes.func,
    updateServiceStatus: PropTypes.func,
    // getESlintResult: PropTypes.func,
    updateRuntimeConfig: PropTypes.func,
    // pkgInfo: PropTypes.object,
  }
  state = {
    defaultActiveKey: 'profile',
    loading: false,
    runtimeConfigerVisible: false,
  }
  componentDidMount() {
    this.getInitData();
    ipcRenderer.removeAllListeners('SERVICE_STOPPED');
    ipcRenderer.on('SERVICE_STOPPED', (event, { pid, rootPath }) => {
      this.updateServiceStatus(false, pid, rootPath);
    });
  }
  componentWillReceiveProps(nextProps) {
    const nextRootPath = nextProps.env.get('rootPath');
    if (nextRootPath !== this.props.env.get('rootPath')) {
      this.props.getEnvData(nextRootPath);
      this.props.getPkgInfo(nextRootPath);
    }
  }
  getInitData = hasLoading => {
    if (hasLoading) {
      this.setState({
        loading: true
      });
    }
    const { env } = this.props;
    const rootPath = env.get('rootPath');
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
    const { env } = this.props;
    const rootPath = env.get('rootPath');
    const projectName = env.getIn(['pkg', 'name']);
    this.props.startServer({
      root: rootPath,
      port: env.getIn(['runtimeConfig', 'port']),
      projectName,
      configerName: `ehdev-configer-${env.getIn(['config', 'type'])}`,
      runtimeConfig: env.get('runtimeConfig').toJS(),
    });
    this.props.setActive(rootPath);
  }
  handleStartBuilder = () => {
    const { env } = this.props;
    const rootPath = env.get('rootPath');
    const projectName = env.getIn(['pkg', 'name']);
    this.props.startBuilder({
      root: rootPath,
      projectName,
      configerName: `ehdev-configer-${env.getIn(['config', 'type'])}`,
    });
    this.props.setActive(rootPath);
  }
  handleStartDllBuilder = () => {
    const { env } = this.props;
    const rootPath = env.get('rootPath');
    const projectName = env.getIn(['pkg', 'name']);
    this.props.startBuilder({
      root: rootPath,
      projectName,
      configerName: `ehdev-configer-${env.getIn(['config', 'type'])}`,
      isDll: true,
    });
    this.props.setActive(rootPath);
  }
  handleStopService = (type, pid) => {
    const { env } = this.props;
    const rootPath = env.get('rootPath');
    const projectName = env.getIn(['pkg', 'name']);
    if (type === 'server') {
      this.props.stopServer(pid, false, {
        rootPath,
        projectName,
      });
    } else if (type === 'builder') {
      this.props.stopBuilder(pid, false, {
        rootPath,
        projectName,
      });
    }
  }
  handleUpdateConfig = config => {
    const { env } = this.props;
    const rootPath = env.get('rootPath');
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
  updateServiceStatus(isRunning, pid, rootPath) {
    const { pids } = this.props;
    if (pids.includes(pid)) {
      this.props.updateServiceStatus(isRunning, pid, rootPath);
    }
  }
  showRuntimeConfiger = () => {
    this.setState({
      runtimeConfigerVisible: true,
    });
  }
  renderProfile() {
    const { env } = this.props;
    const profileProps = {
      rootPath: env.get('rootPath'),
      isGitProject: env.getIn(['scmInfo', 'isGitProject']),
      isSvnProject: env.getIn(['scmInfo', 'isSvnProject']),
      name: env.getIn(['pkg', 'name']),
      version: env.getIn(['pkg', 'version']),
      author: env.getIn(['pkg', 'author']),
      description: env.getIn(['pkg', 'description']),
    };
    return <Profile {...profileProps} />;
  }
  renderSetup() {
    const { env } = this.props;
    const config = env.get('config');
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
    const  { env } = this.props;
    const props = {
      pkgInfo: env.get('pkgInfo'),
      pkg: env.get('pkg'),
      rootPath: env.get('rootPath'),
      refresh: this.getInitData,
    };
    return <DependencyManager {...props} />;
  }
  renderActionBar() {
    const { currentService, env } = this.props;
    const props = {
      currentService,
      runnable: env.get('runnable'),
      dllEnable: env.getIn(['config', 'dll', 'enable'], false),
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
    const { env, setRootPath } = this.props;
    const { runtimeConfigerVisible } = this.state;
    const runtimeConfigerProps = {
      visible: runtimeConfigerVisible,
      close: this.hanleCloseRuntimeConfiger,
      closeWithData: this.hanleCloseRuntimeConfiger,
      formData: env.get('runtimeConfig'),
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
              prevValue={env.get('prevRootPath')}
              value={env.get('rootPath')}
            >
              <h3 className={styles.Project__ProjectName}>
                { env.getIn(['pkg', 'name'], '请选择项目') }
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
              { env.get('runnable') ? <TabPane tab="运行配置" key="config">
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


const projectPageSelector = state => state.get('page.project');
const envSelector = createSelector(
  projectPageSelector,
  pageState => pageState.get('env'),
);
const serviceSelector = createSelector(
  projectPageSelector,
  pageState => ({
    pids: pageState.getIn(['service', 'pids'], Set([])),
    instances: pageState.getIn(['service', 'instances']),
  }),
);

const mapStateToProps = (state) => createSelector(
  envSelector,
  serviceSelector,
  (env, service) => {
    const rootPath = env.get('rootPath');
    return {
      env,
      pids: service.pids,
      currentService: service.instances.get(rootPath),
    };
  },
);
const mapDispatchToProps = dispatch => ({
  setRootPath: rootPath => dispatch(actions.env.setRootPath(rootPath)),
  getEnvData: rootPath => dispatch(actions.env.getEnv(rootPath)),
  setEnvData: (config, rootPath) => dispatch(actions.env.setEnv(config, rootPath, dispatch)),
  setActive: id => dispatch(consoleActions.setActive(id)),
  startServer: params => dispatch(actions.service.startServer(params, dispatch)),
  stopServer: (...args) => dispatch(actions.service.stopServer(...args)),
  startBuilder: params => dispatch(actions.service.startBuilder(params, dispatch)),
  stopBuilder: (...args) => dispatch(actions.service.stopBuilder(...args)),
  updateServiceStatus: (isRunning, pid, rootPath) => dispatch(actions.service.updateStatus(isRunning, pid, rootPath)),
  getOutdated: packageName => dispatch(actions.env.getOutdated(packageName)),
  getPkgInfo: rootPath => dispatch(actions.env.getPkginfo(rootPath)),
  // getESlintResult: rootPath => dispatch(actions.env.getLintResult(rootPath)),
  updateRuntimeConfig: config => dispatch(actions.env.updateRuntimeConfig(config)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectModule);
