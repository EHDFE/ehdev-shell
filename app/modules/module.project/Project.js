/**
 * Project Module
 * @author ryan.bian
 */
import { ipcRenderer } from 'electron';
import { Icon, Spin, Tabs, Button } from 'antd';
import { Map, Set } from 'immutable';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
// import classnames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import DependencyManager from '../../components/component.dependencyManager/';
import FolderPicker from '../../components/component.folderPicker/';
import styles from './index.less';
import ProjectAction from './partialComponent/Action';
import Editor from '../../components/component.editor/';
// import EslintResult from '../../components/component.eslint.result/';
import Profile from './partialComponent/Profile';
import RuntimeConfigModal from './partialComponent/RuntimeConfigModal';
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
    pids: PropTypes.instanceOf(Set),
    currentService: PropTypes.instanceOf(Map),
    getEnvData: PropTypes.func,
    setRootPath: PropTypes.func,
    saveConfig: PropTypes.func,
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
    width: 0,
  }
  componentDidMount() {
    this.getInitData();
    ipcRenderer.removeAllListeners('SERVICE_STOPPED');
    ipcRenderer.on('SERVICE_STOPPED', (event, { pid, rootPath }) => {
      this.updateServiceStatus(false, pid, rootPath);
    });
    window.addEventListener('resize', this.handleResize, false);
    this.setState({
      width: this.root.getBoundingClientRect().width,
    });
  }
  componentWillReceiveProps(nextProps) {
    const nextRootPath = nextProps.env.get('rootPath');
    if (nextRootPath !== this.props.env.get('rootPath')) {
      this.props.getEnvData(nextRootPath);
      this.props.getPkgInfo(nextRootPath);
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false);
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
  handleResize = () => {
    const rect = this.root.getBoundingClientRect();
    this.setState({
      width: rect.width,
    });
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
  saveEditor = () => {
    const { env } = this.props;
    const rootPath = env.get('rootPath');
    const content = this.editor.getValue();
    this.props.saveConfig(rootPath, content);
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
  renderConfig(width) {
    const { env } = this.props;
    const configRaw = env.get('configRaw');
    const style = {
      width,
    };
    return [
      <div
        key="action"
        className={styles.Project__EditorAction}
      >
        <Button size="small" type="primary" onClick={this.saveEditor}>保存</Button>
      </div>,
      <div
        key="editor"
        className={styles.Project__EditorWrapper}
        style={style}
      >
        <Editor
          ref={comp => this.editor = comp}
          language="json"
          content={configRaw}
        />
      </div>
    ];
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
    const { runtimeConfigerVisible, width } = this.state;
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
      <div
        ref={node => this.root = node}
        width={width}
        className={styles.Project__Layout}
      >
        <div className={styles.Project__TopBar}>
          <FolderPicker
            onChange={value => {
              setRootPath(value);
            }}
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
                { this.renderConfig(width) }
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
    );
  }
}

const projectPageSelector = state => state['page.project'];
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
  saveConfig: (rootPath, content) => dispatch(actions.env.saveConfig(rootPath, content)),
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
