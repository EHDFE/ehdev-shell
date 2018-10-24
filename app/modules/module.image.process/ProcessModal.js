import { PureComponent, createRef } from 'react';
import { Modal, Progress, Button, Icon, Spin, Radio } from 'antd';
import { Map, Seq } from 'immutable';
import PropTypes from 'prop-types';
import filesize from 'filesize';
import classnames from 'classnames';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { List } from 'react-virtualized';
import { actions, IN_PROGRESS, PROCESSED } from './store';
import Media from './Media';

import styles from './processModal.less';

const StaticModalProps = {
  title: '批量处理',
  width: 600,
  keyboard: false,
  footer: null,
  maskClosable: false,
};

const IN_PROGRESS_ICON = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class ProcessModal extends PureComponent {
  static propTypes = {
    visible: PropTypes.bool,
    processors: PropTypes.instanceOf(Map),
    data: PropTypes.instanceOf(Seq.Indexed),
    onClose: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    onBatchProcess: PropTypes.func.isRequired,
    changeProcessor: PropTypes.func.isRequired,
    updateProcessorConfig: PropTypes.func.isRequired,
  };
  state = {
    processing: false,
  };
  listInstance = createRef();
  startBatchProcess = () => {
    this.setState(
      {
        processing: true,
      },
      () => {
        this.props.onBatchProcess().then(() => {
          this.setState({
            processing: false,
          });
        });
      },
    );
  };
  componentDidUpdate(prevProps, prevState) {
    if (prevState.processing && !this.state.processing) {
      this.listInstance.current && this.listInstance.current.forceUpdateGrid();
    }
  }
  handleDownload = () => {
    this.props.onDownload();
  };
  handleClose = () => {
    this.props.onClose();
  };
  handleChangeProcessor(id, { target }) {
    this.props.changeProcessor(id, target.value);
    this.listInstance.current.forceUpdateGrid();
  }
  rowRenderer = ({ index, key, style }) => {
    const { data, processors } = this.props;
    const [id, item] = data.get(index);
    const status = item.get('status');
    const percent = status === PROCESSED ? 100 : 0;
    const spinning = status === IN_PROGRESS;
    const processor = processors.getIn([id, 'processor']);
    const availableProcessors = processors.getIn([id, 'availableProcessors']);
    return (
      <Spin key={key} spinning={spinning} indicator={IN_PROGRESS_ICON}>
        <div
          className={classnames(styles.ProcessModal__ListItem)}
          style={style}
        >
          <Media
            className={styles['ProcessModal__ListItem--image']}
            data={item.get('originalImage')}
            useThumb
          />
          <div className={styles['ProcessModal__ListItem--desc']}>
            <Progress percent={percent} />
            <h4 className={styles['ProcessModal__ListItem--name']} title={id}>
              {id}
            </h4>
            <div className={styles['ProcessModal__ListItem--meta']}>
              <span>
                {filesize(item.getIn(['originalImage', 'size'], 0), {
                  base: 10,
                })}
              </span>
              <Radio.Group
                value={processor}
                size="small"
                onChange={this.handleChangeProcessor.bind(this, id)}
              >
                {availableProcessors.map(p => (
                  <Radio.Button value={p} key={p}>
                    {p}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </div>
          </div>
        </div>
      </Spin>
    );
  };
  renderContent() {
    const { data } = this.props;
    return (
      <List
        ref={this.listInstance}
        width={550}
        height={400}
        className={styles.ProcessModal__List}
        rowCount={data.size}
        rowHeight={75}
        rowRenderer={this.rowRenderer}
      />
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
      >
        开始处理
      </Button>,
    ];
    if (!processing && data.some(([id, v]) => v.get('status') === PROCESSED)) {
      ctrls.unshift(
        <Button
          key="download"
          onClick={this.handleDownload}
          style={{ marginRight: 10 }}
        >
          全部保存
        </Button>,
      );
    }
    return <div className={styles.ProcessModal__Ctrl}>{ctrls}</div>;
  }
  render() {
    const { visible } = this.props;
    const props = Object.assign({}, StaticModalProps, {
      visible,
      onCancel: this.handleClose,
      wrapClassName: styles.ProcessModal,
    });
    return (
      <Modal {...props}>
        {this.renderContent()}
        {this.renderCtrl()}
      </Modal>
    );
  }
}

const pageSelector = state => state['page.image.process'];
const mapStateToProps = state =>
  createSelector(pageSelector, pageState => {
    const processors = pageState.get('processors', Map());
    return {
      processors,
    };
  });

const mapDispatchToProps = dispatch => ({
  changeProcessor: (id, processor) =>
    dispatch(actions.changeProcessor(id, processor)),
  updateProcessorConfig: (id, config) =>
    dispatch(actions.updateProcessorConfig(id, config)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProcessModal);
