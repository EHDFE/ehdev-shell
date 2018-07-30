import { connect } from 'react-redux';
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, notification, Icon } from 'antd';
import { createSelector } from 'reselect';
import { Map } from 'immutable';
import classnames from 'classnames';
import UploadZone from '../../components/component.uploadZone/';
import FileCard from '../../components/component.fileCard/';
import { actions } from './store';

import styles from './index.less';

class Portal extends PureComponent {
  static propTypes = {
    fileList: PropTypes.instanceOf(Map),
    serverHost: PropTypes.string,
    serverRunning: PropTypes.bool,
    initPortal: PropTypes.func,
    add: PropTypes.func,
    remove: PropTypes.func,
    startServer: PropTypes.func,
    stopServer: PropTypes.func,
    generateQrcode: PropTypes.func,
  };
  state = {
    view: {},
  }
  static getDerivedStateFromProps(props, state) {
    const { view } = state;
    const { fileList } = props;
    const newView = {};
    fileList.forEach((file, id) => {
      Object.assign(newView, {
        [id]: id in view ? view[id] : false,
      });
    });
    return {
      view: newView,
    };
  }
  constructor(props) {
    super(props);
    this.props.initPortal()
      .then(({ payload }) => {
        this.updateQrcode(Object.keys(payload.fileMap));
      });
  }
  handleStartServer = () => {
    this.props.startServer()
      .then(() => {
        this.updateQrcode(this.props.fileList.keySeq().toArray());
        notification.info({
          message: '传送门已开启',
          description: '使用手机扫描二维码开始下载',
        });
      });
  }
  handleStopServer = () => {
    this.props.stopServer()
      .then(() => {
        notification.info({
          message: '传送门已关闭',
          description: '🎃',
        });
      });
  }
  handleAddFile = async files => {
    const { add } = this.props;
    try {
      const { payload } = await add(files);
      await this.updateQrcode(payload.ids);
    } catch (e) {
      notification.error({
        message: '添加失败',
        description: e.toString(),
      });
    }
  }
  handleDelFile = async e => {
    const { remove } = this.props;
    await remove(e.currentTarget.dataset.id);
  }
  handleViewModeToggle = e => {
    const id = e.currentTarget.dataset.id;
    const { view } = this.state;
    this.setState({
      view: Object.assign({}, view, {
        [id]: !view[id],
      }),
    });
  }
  async updateQrcode(ids) {
    if (ids.length === 0) return;
    const { serverHost, generateQrcode } = this.props;
    const urlMap = {};
    ids.forEach(id => {
      Object.assign(urlMap, {
        [id]: `${serverHost}/${id}`,
      });
    });
    try {
      await generateQrcode(urlMap);
    } catch (e) {
      throw e;
    }
  }
  renderCtrl() {
    const { serverRunning } = this.props;
    return (
      <div>
        <UploadZone
          accept="all"
          content="添加您要传送的文件"
          height={80}
          onChange={this.handleAddFile}
          disabled={!serverRunning}
        />
        <div className={styles.Portal__Action}>
          <Button
            disabled={serverRunning}
            onClick={this.handleStartServer}
          >启动服务</Button>
          <Button
            disabled={!serverRunning}
            onClick={this.handleStopServer}
          >停止服务</Button>
        </div>
      </div>
    );
  }
  renderList() {
    const { fileList } = this.props;
    const { view } = this.state;
    return (
      <div className={styles.Portal__List}>
        {fileList.map((item, id) => {
          const file = item.get('file');
          return (
            <div
              key={id}
              className={styles.Portal__Item}
            >
              <FileCard
                type={file.type}
                name={file.name}
              >
                <div className={styles.Portal__QrcodeLayer}>
                  <div className={styles.Portal__QrcodeMask}>
                    <button
                      className={styles.Portal__QrcodeBtn}
                      type="button"
                      data-id={id}
                      onClick={this.handleViewModeToggle}
                    >
                      {
                        view[id] ? <Icon type="qrcode" /> : <Icon type="paper-clip" />
                      }
                    </button>
                    <button
                      className={styles.Portal__QrcodeBtn}
                      type="button"
                      data-id={id}
                      onClick={this.handleDelFile}
                    >
                      <Icon type="close" />
                    </button>
                  </div>
                  <img
                    className={classnames(
                      styles.Portal__QrcodeImage,
                      {
                        [styles['Portal__QrcodeImage--hide']]: view[id],
                      },
                    )}
                    src={item.get('qrcode')}
                    alt={file.name}
                  />
                </div>
              </FileCard>
            </div>
          );
        }).valueSeq()}
      </div>
    );
  }
  render() {
    return (
      <div className={styles.Portal}>
        { this.renderCtrl() }
        { this.renderList() }
      </div>
    );
  }
}

const pageSelector = state => state['page.portal'];
const mapStateToProps = state => createSelector(
  pageSelector,
  pageState => ({
    serverHost: pageState.get('host'),
    serverRunning: pageState.get('running'),
    fileList: pageState.get('files'),
  }),
);

const mapDispatchToProps = dispatch => ({
  initPortal: () => dispatch(actions.initPortal()),
  add: files => dispatch(actions.addPortal(files)),
  remove: id => dispatch(actions.removePortal(id)),
  startServer: () => dispatch(actions.startServer()),
  stopServer: () => dispatch(actions.stopServer()),
  generateQrcode: urlMap => dispatch(actions.generateQrcode(urlMap)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Portal);
