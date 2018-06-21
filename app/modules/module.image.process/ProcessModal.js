import { PureComponent, Fragment } from 'react';
import { Modal, Progress, Button, Dropdown, Menu, Icon, Tag, Spin } from 'antd';
import { Map } from 'immutable';
import PropTypes from 'prop-types';
import filesize from 'filesize';
import ScrollArea from 'react-scrollbar';
import { IN_PROGRESS, PROCESSED } from './store';

import styles from './index.less';

const StaticModalProps = {
  title: '批量处理',
  width: 600,
  keyboard: false,
  footer: null,
  maskClosable: false,
};

const IN_PROGRESS_ICON = <Icon type="loading" style={{ fontSize: 24 }} spin />;

export default class ProcessModal extends PureComponent {
  static propTypes = {
    visible: PropTypes.bool,
    processors: PropTypes.instanceOf(Map),
    data: PropTypes.instanceOf(Map),
    onClose: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    onBatchProcess: PropTypes.func.isRequired,
    onChangeProcessor: PropTypes.func.isRequired,
  }
  state = {
    processing: false,
  }
  startBatchProcess = () => {
    this.setState({
      processing: true,
    }, () => {
      this.props.onBatchProcess()
        .then(() => {
          this.setState({
            processing: false,
          });
        });
    });
  }
  handleDownload = () => {
    this.props.onDownload();
  }
  handleClose = () => {
    this.props.onClose();
  }
  handleChangeProcessor(id, { key }) {
    this.props.onChangeProcessor(id, key);
  }
  renderItem(data, id) {
    const { processors } = this.props;
    const status = data.get('status');
    const percent = status === PROCESSED ? 100 : 0;
    const spinning = status === IN_PROGRESS;
    const processor = processors.getIn([id, 'processor']);
    const availableProcessors = processors.getIn([id, 'availableProcessors']);
    const menu = (
      <Menu onClick={this.handleChangeProcessor.bind(this, id)}>
        {availableProcessors.map(p =>
          <Menu.Item key={p}>{p}</Menu.Item>
        )}
      </Menu>
    );
    return (
      <Spin key={id} spinning={spinning} indicator={IN_PROGRESS_ICON}>
        <div className={styles.ProcessModal__ListItem}>
          <img
            className={styles['ProcessModal__ListItem--image']}
            src={data.getIn(['originalImage', 'url'])} alt=""
          />
          <div className={styles['ProcessModal__ListItem--desc']}>
            <Progress percent={percent} />
            <h4 className={styles['ProcessModal__ListItem--name']} title={id}>{ id }</h4>
            <div className={styles['ProcessModal__ListItem--meta']}>
              <Dropdown overlay={menu}>
                <Tag color="#108ee9">
                  <Fragment>{processor} <Icon type="setting" /></Fragment>
                </Tag>
              </Dropdown>
              <Tag color="#108ee9">
                {filesize(data.getIn(['originalImage', 'size'], 0), { base: 10 })}
              </Tag>
            </div>
          </div>
        </div>
      </Spin>
    );
  }
  renderContent() {
    const { data } = this.props;
    return (
      <ScrollArea
        speed={1}
        horizontal={false}
        style={{ maxHeight: '50vh' }}
      >
        <div className={styles.ProcessModal__List}>
          {
            data.map(
              (map, id) => this.renderItem(map, id)
            ).valueSeq().toArray()
          }
        </div>
      </ScrollArea>
    );
  }
  renderCtrl() {
    const { data } = this.props;
    const { processing } = this.state;
    const ctrls = [
      <Button
        key="start"
        type="primary"
        onClick={this.startBatchProcess}
        loading={processing}
      >开始处理</Button>
    ];
    if (!processing && data.some(v => v.get('status') === PROCESSED)) {
      ctrls.unshift(
        <Button
          key="download"
          onClick={this.handleDownload}
          style={{ marginRight: 10 }}
        >
          批量下载
        </Button>
      );
    }
    return (
      <div className={styles.ProcessModal__Ctrl}>
        { ctrls }
      </div>
    );
  }
  render() {
    const { visible } = this.props;
    const props = Object.assign({}, StaticModalProps, {
      visible,
      onCancel: this.handleClose,
    });
    return (
      <Modal {...props}>
        { this.renderContent() }
        { this.renderCtrl() }
      </Modal>
    );
  }
}
