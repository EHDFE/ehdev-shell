import path from 'path';
import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { Map } from 'immutable';
import { notification, Icon, Menu, Dropdown } from 'antd';
import { remote } from 'electron';
import moment from 'moment';
import UploadZone from '../../components/component.uploadZone/';
import PreviewComponent from './Preview';
import ProcessModal from './ProcessModal';
import { getProcessorComponent, getDefaultProcessorConfig } from './processorExport';
import { actions, IN_PROGRESS, PROCESSED, UNPROCESSED } from './store';
import fm from '../../service/fileManager/';
import styles from './index.less';

const { dialog } = remote;

class ImageProcess extends PureComponent {
  static propTypes = {
    addFile: PropTypes.func,
    removeFile: PropTypes.func,
    minify: PropTypes.func,
    beforeMinify: PropTypes.func,
    getSsimScore: PropTypes.func,
    changeProcessor: PropTypes.func,
    updateProcessorConfig: PropTypes.func,
    setStatus: PropTypes.func,
    processors: PropTypes.instanceOf(Map),
    images: PropTypes.instanceOf(Map),
    imageList: PropTypes.arrayOf(PropTypes.string),
  };
  static getDerivedStateFromProps(props, state) {
    if (props.images.equals(state.images)) return null;
    const currentImage = state.currentImage && props.imageList.includes(state.currentImage) ?
      state.currentImage : props.imageList[0];
    return {
      images: props.images,
      currentImage,
    };
  }
  state = {
    currentImage: null,
    images: new Map(),
    batchProcessModalVisible: false,
  }
  handleChangeImage = files => {
    for (const file of files) {
      this.props.addFile(file);
    }
  }
  getCompareScore(currentImage) {
    const { images, getSsimScore } = this.props;
    const processedImageBuffer = images.getIn([currentImage, 'processedImage', 'buffer']);
    getSsimScore(currentImage, processedImageBuffer);
  }
  handleProcess = async () => {
    const { images, processors, setStatus, beforeMinify, minify } = this.props;
    const { currentImage } = this.state;
    const processor = processors.getIn([currentImage, 'processor']);
    const type = images.getIn([currentImage, 'originalImage', 'type']);
    const config = processors.getIn([currentImage, 'config']);
    const defaultConfig = getDefaultProcessorConfig(processor);
    const options = Object.assign({}, defaultConfig, config);
    try {
      beforeMinify([currentImage]);
      await minify(
        currentImage,
        processor,
        options,
      );
      notification.success({
        message: '处理成功',
      });
      if (type === 'image/jpg' || type === 'image/jpeg') {
        this.getCompareScore(currentImage);
      }
    } catch (e) {
      notification.error({
        message: '操作失败',
        description: e.message,
      });
      setStatus(currentImage, UNPROCESSED);
    }
  }
  handleChangeProcessor = ({ key }) => {
    const { currentImage } = this.state;
    this.props.changeProcessor(currentImage, key);
  }
  handleRemoveImage = current => {
    this.props.removeFile(current);
  }
  handleChangeCurrentImage = currentImage => {
    this.setState({
      currentImage,
    });
  }
  handleBatchProcess = async () => {
    const { images, processors, minify, beforeMinify, setStatus } = this.props;
    beforeMinify(Array.from(images.keys()));
    const imageIrerator = images.keys();
    for (const id of imageIrerator) {
      const processor = processors.getIn([id, 'processor']);
      const config = processors.getIn([id, 'config']);
      const defaultConfig = getDefaultProcessorConfig(processor);
      // console.log(id, processor, config, defaultConfig);
      try {
        await minify(
          id,
          processor,
          Object.assign({}, defaultConfig, config),
        );
      } catch (e) {
        notification.error({
          message: '操作失败',
          description: e.message,
        });
        setStatus(id, UNPROCESSED);
      }
    }
    return true;
  }
  handleBatchDownload = async () => {
    dialog.showOpenDialog({
      properties: [
        'openDirectory',
        'createDirectory',
      ],
    }, filePaths => {
      if (Array.isArray(filePaths) && filePaths.length > 0) {
        // save to filePath
        const { images } = this.props;
        const dir = filePaths[0];
        const files = images
          .filter(map => map.get('status') === PROCESSED)
          .toList()
          .map(m => m.get('processedImage'))
          .values();
        const suffix = moment().format('YYYY_MM_DD_HH_mm_ss');
        for (const file of files) {
          const savePath = path.join(dir, `${file.get('fileName')}.${suffix}.${file.get('ext')}`);
          try {
            fm.saveFile(
              savePath,
              file.get('buffer')
            );
          } catch (e) {
            notification.error({
              message: `下载失败: ${savePath}`,
              description: e.message,
            });
          }
        }
        notification.success({
          message: '批量下载完成',
        });
      }
    });
  }
  handleCloseProcessModal = () => {
    this.setState({
      batchProcessModalVisible: false,
    });
  }
  handleOpenProcessModal = () => {
    this.setState({
      batchProcessModalVisible: true,
    });
  }
  renderProcessorPane() {
    const { images, processors, updateProcessorConfig } = this.props;
    const { currentImage } = this.state;
    const originalImage = images.getIn([currentImage, 'originalImage']);
    const processor = processors.getIn([currentImage, 'processor']);
    const availableProcessors = processors.getIn([currentImage, 'availableProcessors']);
    const config = processors.getIn([currentImage, 'config']);
    const menuProps = {
      onClick: this.handleChangeProcessor,
    };
    const processMenu = (
      <Menu {...menuProps}>
        {
          availableProcessors.map(processor => (
            <Menu.Item key={processor}>
              {processor}
            </Menu.Item>
          ))
        }
      </Menu>
    );
    const Processor = getProcessorComponent(processor);
    return (
      <Fragment>
        <Dropdown
          overlay={processMenu}
        >
          <div className={styles.ImageProcess__ProcessorTitle}>
            <h3>{processor}</h3>
            <Icon type="setting" />
          </div>
        </Dropdown>
        <Processor
          className={styles.ImageProcess__EditorWrap}
          data={originalImage}
          config={config}
          onChange={data => {
            updateProcessorConfig(currentImage, data);
          }}
        />
      </Fragment>
    );
  }
  renderUploadZone() {
    return (
      <div className={styles.ImageProcess__FilePickerZone}>
        <UploadZone
          height={'calc(100vh - 110px)'}
          onChange={this.handleChangeImage}
          multiple
          accept={['image', 'video']}
        />
      </div>
    );
  }
  render() {
    const { images } = this.props;
    const { currentImage, batchProcessModalVisible } = this.state;
    const inProgress = images.getIn([currentImage, 'status']) === IN_PROGRESS;
    let content;
    if (images.size > 0) {
      content = [
        <div className={styles.ImageProcess__PreviewView} key="preview">
          <PreviewComponent
            data={images}
            list={images.keySeq()}
            processing={inProgress}
            current={currentImage}
            onRemove={this.handleRemoveImage}
            onStart={this.handleProcess}
            onChange={this.handleChangeCurrentImage}
            onOpenBatchProcess={this.handleOpenProcessModal}
            onBatchDownload={this.handleBatchDownload}
            insertImage={this.handleChangeImage}
          />
        </div>,
        <div className={styles.ImageProcess__EditorView} key="editor">
          { this.renderProcessorPane() }
        </div>,
        <ProcessModal
          key="modal"
          visible={batchProcessModalVisible}
          data={images}
          onClose={this.handleCloseProcessModal}
          onDownload={this.handleBatchDownload}
          onBatchProcess={this.handleBatchProcess}
        />
      ];
    } else {
      content = this.renderUploadZone();
    }
    return (
      <section className={styles.ImageProcess}>
        <div className={styles.ImageProcess__Row}>
          { content }
        </div>
      </section>
    );
  }
}

const pageSelector = state => state['page.image.process'];
const mapStateToProps = (state) => createSelector(
  pageSelector,
  pageState => {
    const images = pageState.get('images', Map());
    const processors = pageState.get('processors', Map());
    return {
      images,
      imageList: Object.keys(images.toObject()),
      processors,
    };
  },
);

const mapDispatchToProps = dispatch => ({
  addFile: files => dispatch(actions.add(files)),
  removeFile: filePath => dispatch(actions.remove(filePath)),
  minify: (input, plugin, options) => dispatch(actions.minify(input, plugin, options)),
  getSsimScore: (input1, input2) => dispatch(actions.getSsimScore(input1, input2)),
  setStatus: (id, status) => dispatch(actions.setStatus(id, status)),
  beforeMinify: ids => dispatch(actions.beforeMinify(ids)),
  changeProcessor: (id, processor) => dispatch(actions.changeProcessor(id, processor)),
  updateProcessorConfig: (id, config) => dispatch(actions.updateProcessorConfig(id, config)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImageProcess);
