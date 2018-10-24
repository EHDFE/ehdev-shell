/**
 * Project Module
 * @author ryan.bian
 */
import { ipcRenderer } from 'electron';
import { Spin, Tabs } from 'antd';
import { Map } from 'immutable';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
// import classnames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import FolderPicker from '../../components/component.folderPicker/';
import styles from './index.less';
import ProjectAction from './partialComponent/Action';
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
  };
  static propTypes = {
    env: PropTypes.instanceOf(Map),
    rootPath: PropTypes.string,
    currentService: PropTypes.instanceOf(Map),
    getEnvData: PropTypes.func,
    setRootPath: PropTypes.func,
    setActive: PropTypes.func,
    startService: PropTypes.func,
    stopService: PropTypes.func,
    updateRuntimeConfig: PropTypes.func,
  };
  state = {
    defaultActiveKey: 'profile',
    loading: false,
    runtimeConfigerVisible: false,
    width: 0,
  };
  componentDidMount() {
    this.getInitData();
    ipcRenderer.removeAllListeners('SERVICE_STOPPED');
    ipcRenderer.on('SERVICE_STOPPED', (event, { pid, rootPath }) => {
      // TODO: SERVICE_STOPPED
    });
    window.addEventListener('resize', this.handleResize, false);
    this.setState({
      width: this.root.getBoundingClientRect().width,
    });
  }
  componentDidUpdate(prevProps) {
    if (prevProps.rootPath !== this.props.rootPath) {
      this.props.getEnvData(this.props.rootPath);
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false);
  }
  getInitData = hasLoading => {
    if (hasLoading) {
      this.setState({
        loading: true,
      });
    }
    const { rootPath } = this.props;
    if (rootPath) {
      return Promise.all([this.props.getEnvData(rootPath)]).then(() => {
        if (hasLoading) {
          this.setState({
            loading: false,
          });
        }
      });
    }
    return Promise.resolve();
  };
  handleResize = () => {
    const rect = this.root.getBoundingClientRect();
    this.setState({
      width: rect.width,
    });
  };
  handleStartServer = () => {
    const { env, rootPath, currentService } = this.props;
    const projectName = env.getIn(['pkg', 'name']);
    this.props.startService('server', {
      ppid: currentService.get('ppid'),
      root: rootPath,
      port: env.getIn(['runtimeConfig', 'port']),
      projectName,
      configerName: `ehdev-configer-${env.getIn(['config', 'type'])}`,
      runtimeConfig: env.get('runtimeConfig').toJS(),
    });
    this.props.setActive(rootPath);
  };
  handleStartBuilder = () => {
    const { env, rootPath, currentService } = this.props;
    const projectName = env.getIn(['pkg', 'name']);
    this.props.startService('builder', {
      ppid: currentService.get('ppid'),
      root: rootPath,
      projectName,
      configerName: `ehdev-configer-${env.getIn(['config', 'type'])}`,
      runtimeConfig: env.get('runtimeConfig').toJS(),
    });
    this.props.setActive(rootPath);
  };
  handleStartDllBuilder = () => {
    const { env, rootPath, currentService } = this.props;
    const projectName = env.getIn(['pkg', 'name']);
    this.props.startService('builder', {
      ppid: currentService.get('ppid'),
      root: rootPath,
      projectName,
      configerName: `ehdev-configer-${env.getIn(['config', 'type'])}`,
      runtimeConfig: Object.assign(
        {
          isDll: true,
        },
        env.get('runtimeConfig').toJS(),
      ),
    });
    this.props.setActive(rootPath);
  };
  handleStopService = type => {
    const { rootPath, currentService } = this.props;
    this.props.stopService(type, {
      ppid: currentService.get('ppid'),
      root: rootPath,
    });
  };
  hanleCloseRuntimeConfiger = configData => {
    if (configData) {
      this.props.updateRuntimeConfig(configData);
    }
    this.setState({
      runtimeConfigerVisible: false,
    });
  };
  showRuntimeConfiger = () => {
    this.setState({
      runtimeConfigerVisible: true,
    });
  };
  renderProfile() {
    const { env, rootPath } = this.props;
    const profileProps = {
      rootPath,
      isGitProject: env.getIn(['scmInfo', 'isGitProject']),
      isSvnProject: env.getIn(['scmInfo', 'isSvnProject']),
      name: env.getIn(['pkg', 'name']),
      version: env.getIn(['pkg', 'version']),
      author: env.getIn(['pkg', 'author']),
      description: env.getIn(['pkg', 'description']),
    };
    return <Profile {...profileProps} />;
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
  tabKey = key => {
    this.setState({
      defaultActiveKey: key,
    });
  };
  render() {
    const { env, setRootPath } = this.props;
    const { runtimeConfigerVisible, width } = this.state;
    const runtimeConfigerProps = {
      visible: runtimeConfigerVisible,
      close: this.hanleCloseRuntimeConfiger,
      closeWithData: this.hanleCloseRuntimeConfiger,
      formData: env.get('runtimeConfig'),
    };
    return (
      <div
        ref={node => (this.root = node)}
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
              {env.getIn(['pkg', 'name'], '请选择项目')}
            </h3>
          </FolderPicker>
          {this.renderActionBar()}
        </div>
        <Spin
          className={styles.Project__ContentSpin}
          spinning={this.state.loading}
        >
          <Tabs
            defaultActiveKey={this.state.defaultActiveKey}
            onChange={this.tabKey}
            animated={false}
          >
            <TabPane tab="基础信息" key="profile">
              <div className={styles.Project__TabContent}>
                {this.renderProfile()}
              </div>
            </TabPane>
          </Tabs>
        </Spin>
        <RuntimeConfigModal {...runtimeConfigerProps} />
      </div>
    );
  }
}

const envSelector = state => state['page.project.env'];
const serviceSelector = state => state['page.project.service'];
const mapStateToProps = () =>
  createSelector(envSelector, serviceSelector, (env, service) => {
    const rootPath = env.get('rootPath');
    return {
      env,
      rootPath,
      currentService: service.getIn(['instances', rootPath], Map()),
    };
  });

const mapDispatchToProps = dispatch => ({
  setRootPath: rootPath => dispatch(actions.env.setRootPath(rootPath)),
  getEnvData: rootPath => dispatch(actions.env.getEnv(rootPath)),
  setActive: id => dispatch(consoleActions.setActive(id)),
  startService: (serviceType, params) =>
    dispatch(actions.service.start(serviceType, params)),
  stopService: (serviceType, params) =>
    dispatch(actions.service.stop(serviceType, params)),
  updateRuntimeConfig: config =>
    dispatch(actions.env.updateRuntimeConfig(config)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectModule);
