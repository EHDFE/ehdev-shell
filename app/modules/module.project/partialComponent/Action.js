import { Dropdown, Menu } from 'antd';
import { Map } from 'immutable';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import IconBuild from 'react-icons/lib/fa/codepen';
import IconPlay from 'react-icons/lib/fa/play-circle-o';
import IconStop from 'react-icons/lib/fa/stop-circle-o';
import MdAutorenew from 'react-icons/lib/md/autorenew';
import IconMoreVert from 'react-icons/lib/md/more-vert';
import styles from '../index.less';


export default class ProjectAction extends PureComponent {
  static defaultProps = {
    currentService: Map(),
    runnable: false,
    dllEnable: false,
    getInitData() {},
    handleStartServer() {},
    handleStartBuilder() {},
    handleStopService() {},
    handleStartDllBuilder() {},
    onClickRuntimeConfiger() {},
  }
  static propTypes = {
    currentService: PropTypes.instanceOf(Map),
    runnable: PropTypes.bool,
    dllEnable: PropTypes.bool,
    getInitData: PropTypes.func,
    handleStartServer: PropTypes.func,
    handleStartBuilder: PropTypes.func,
    handleStopService: PropTypes.func,
    handleStartDllBuilder: PropTypes.func,
    onClickRuntimeConfiger: PropTypes.func,
  }
  getInitData = (tag) => {
    this.props.getInitData(tag);
  }
  handleStartServer = () => {
    this.props.handleStartServer();
  }
  handleStartBuilder = () => {
    this.props.handleStartBuilder();
  }
  handleStopService = e => {
    const { type, pid } = e.target.dataset;
    this.props.handleStopService(type, pid);
  }
  handleStartDllBuilder = () => {
    this.props.handleStartDllBuilder();
  }
  onClickRuntimeConfiger = () => {
    this.props.onClickRuntimeConfiger();
  }
  render() {
    const { currentService, runnable, dllEnable } = this.props;
    const isRunning = currentService.get('running');
    const type = currentService.get('type');
    let actions;
    let buildButton = (
      <button
        className={styles.Project__ActionBarButton}
        key={'start-build'}
        disabled={isRunning}
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
      if (dllEnable) {
        buildButton = (
          <div key="start-build-group" className={styles['Project__ActionBarGrid']}>
            { buildButton }
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              overlay={
                <Menu>
                  <Menu.Item>
                    <button
                      className={styles['Project__ActionBarButton--trigger']}
                      key={'start-dll-build'}
                      disabled={isRunning}
                      onClick={this.handleStartDllBuilder}
                    >
                      DLL构建
                    </button>
                  </Menu.Item>
                </Menu>
              }>
              <IconMoreVert className={styles['Project__ActionBarMore']} />
            </Dropdown>
          </div>
        );
      }
      actions = [
        <div
          key="start-server"
          className={styles['Project__ActionBarGrid']}
        >
          <button
            className={styles.Project__ActionBarButton}
            disabled={isRunning}
            onClick={this.handleStartServer}
          >
            <IconPlay size={22} />
            启动
          </button>
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            overlay={
              <Menu>
                <Menu.Item>
                  <button
                    className={styles['Project__ActionBarButton--trigger']}
                    key={'advance-config'}
                    onClick={this.onClickRuntimeConfiger}
                  >
                    运行配置
                  </button>
                </Menu.Item>
              </Menu>
            }
          >
            <IconMoreVert className={styles['Project__ActionBarMore']} />
          </Dropdown>
        </div>,
        buildButton,
      ];
      if (isRunning && type === 'server') {
        actions.push(
          <button
            className={styles.Project__ActionBarButton}
            key={'stop-server'}
            onClick={this.handleStopService}
            data-type={'server'}
            data-pid={currentService.get('pid')}
          >
            <IconStop size={22} />
            停止服务
          </button>
        );
      }
      if (isRunning && type === 'builder') {
        actions.push(
          <button
            className={styles.Project__ActionBarButton}
            key={'stop-builder'}
            onClick={this.handleStopService}
            data-type={'builder'}
            data-pid={currentService.get('pid')}
          >
            <IconStop size={22} />
            停止构建
          </button>
        );
      }
      actions.push(refreshButton);
    } else {
      actions = [
        refreshButton
      ];
    }
    return <div className={styles.Project__ActionBar}>{actions}</div>;
  }
}
