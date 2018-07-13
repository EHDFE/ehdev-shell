import { PureComponent, Fragment } from 'react';
import { Modal, Progress, Button, Dropdown, Menu, Icon, Tag, Spin } from 'antd';
import { Map } from 'immutable';
import PropTypes from 'prop-types';
import filesize from 'filesize';
import classnames from 'classnames';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import Transition from 'react-transition-group/Transition';
import { getProcessorComponent } from './processorExport';
import { actions, IN_PROGRESS, PROCESSED } from './store';
import Media from './Media';

import styles from './index.less';

const StaticModalProps = {
  title: '批量处理',
  width: 600,
  keyboard: false,
  footer: null,
  maskClosable: false,
};

const IN_PROGRESS_ICON = <Icon type="loading" style={{ fontSize: 24 }} spin />;

const defaultEditorStyle = {
  transition: 'background-color 300ms ease-in-out',
  backgroundColor: '#fefefe',
};
const transitionStyles = {
  entering: { backgroundColor: 'rgba(24, 144, 255, 0.2)' },
  entered: { backgroundColor: '#fefefe' },
};

class ProcessModal extends PureComponent {
  static propTypes = {
    visible: PropTypes.bool,
    processors: PropTypes.instanceOf(Map),
    data: PropTypes.instanceOf(Map),
    onClose: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    onBatchProcess: PropTypes.func.isRequired,
    changeProcessor: PropTypes.func.isRequired,
    updateProcessorConfig: PropTypes.func.isRequired,
  }
  state = {
    processing: false,
    editId: null,
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
    this.props.changeProcessor(id, key);
  }
  handleToggleProcessorPanel(id) {
    this.setState(prevState => {
      return {
        ...prevState,
        editId: prevState.editId === id ? null : id,
      };
    });
  }
  renderItem(data, id) {
    const { processors, updateProcessorConfig } = this.props;
    const { editId } = this.state;
    const status = data.get('status');
    const percent = status === PROCESSED ? 100 : 0;
    const spinning = status === IN_PROGRESS;
    const processor = processors.getIn([id, 'processor']);
    const availableProcessors = processors.getIn([id, 'availableProcessors']);
    const config = processors.getIn([id, 'config']);
    const menu = (
      <Menu onClick={this.handleChangeProcessor.bind(this, id)}>
        {availableProcessors.map(p =>
          <Menu.Item key={p}>{p}</Menu.Item>
        )}
      </Menu>
    );
    const Processor = getProcessorComponent(processor);
    const processorEditor = (
      <Transition
        in={editId === id}
        mountOnEnter
        unmountOnExit
        timeout={300}
      >
        {state => (
          <div
            className={styles['ProcessModal__ListItem--editor']}
            style={{
              ...defaultEditorStyle,
              ...transitionStyles[state],
            }}
          >
            <Processor
              data={data.get('originalImage')}
              config={config}
              layout="horizontal"
              onChange={data => {
                updateProcessorConfig(id, data);
              }}
            />
          </div>
        )}
      </Transition>
    );
    return (
      <Spin key={id} spinning={spinning} indicator={IN_PROGRESS_ICON}>
        <div className={
          classnames(styles.ProcessModal__ListItem, {
            [styles['ProcessModal__ListItem--inedit']]: editId === id,
          })
        }>
          <Media
            className={styles['ProcessModal__ListItem--image']}
            data={data.get('originalImage')}
          />
          <div className={styles['ProcessModal__ListItem--desc']}>
            <Progress percent={percent} />
            <h4 className={styles['ProcessModal__ListItem--name']} title={id}>{ id }</h4>
            <div className={styles['ProcessModal__ListItem--meta']}>
              <span>
                {filesize(data.getIn(['originalImage', 'size'], 0), { base: 10 })}
              </span>
              <Dropdown overlay={menu}>
                <Tag color="#108ee9" onClick={this.handleToggleProcessorPanel.bind(this, id)}>
                  <Fragment>{processor} <Icon type="setting" /></Fragment>
                </Tag>
              </Dropdown>
            </div>
          </div>
          { processorEditor }
        </div>
      </Spin>
    );
  }
  renderContent() {
    const { data } = this.props;
    return (
      <div className={styles.ProcessModal__List}>
        {
          data.map(
            (map, id) => this.renderItem(map, id)
          ).valueSeq().toArray()
        }
      </div>
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

const pageSelector = state => state['page.image.process'];
const mapStateToProps = (state) => createSelector(
  pageSelector,
  pageState => {
    const processors = pageState.get('processors', Map());
    return {
      processors,
    };
  },
);

const mapDispatchToProps = dispatch => ({
  changeProcessor: (id, processor) => dispatch(actions.changeProcessor(id, processor)),
  updateProcessorConfig: (id, config) => dispatch(actions.updateProcessorConfig(id, config)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProcessModal);
