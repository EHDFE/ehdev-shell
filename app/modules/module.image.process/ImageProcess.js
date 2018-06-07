import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { Map } from 'immutable';
import { Row, Col, Button, Tabs, notification, Icon } from 'antd';
import classnames from 'classnames';
import filesize from 'filesize';
import UploadZone from '../../components/component.uploadZone/';
import Pngquant from './processors/Pngquant';
import Gifsicle from './processors/Gifsicle';
import Mozjpeg from './processors/Mozjpeg';
import Webp from './processors/Webp';
// import Gif2webp from './processors/Gif2webp';
import { actions } from './store';

import styles from './index.less';

const TabPane = Tabs.TabPane;

const PROCESSOR_MAP = new window.Map([
  ['image/gif', [Gifsicle]],
  ['image/jpeg', [Mozjpeg, Webp]],
  ['image/png', [Pngquant, Webp]],
  ['image/webp', [Webp]],
]);

class ImageProcess extends PureComponent {
  static propTypes = {
    addFile: PropTypes.func,
    removeFile: PropTypes.func,
    minify: PropTypes.func,
    minifyBuffer: PropTypes.func,
    originalImage: PropTypes.instanceOf(Map),
    processedImage: PropTypes.instanceOf(Map),
  };
  static getDerivedStateFromProps(props, state) {
    if (props.originalImage.equals(state.originalImage)) return;
    const availableProcessors = PROCESSOR_MAP.get(props.originalImage.get('type')) || [];
    return {
      originalImage: props.originalImage,
      currentProcessor: availableProcessors.length > 0 ? availableProcessors[0].processorName : null,
      availableProcessors,
    };
  }
  state = {
    indicatorLeft: 0,
    currentProcessor: null,
    availableProcessors: [],
    originalImage: new Map(),
    processing: false,
  }
  processorRef = {}
  handleChangeImage = files => {
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        this.props.addFile(file);
        // if (file.path) {
        //   this.props.minify([
        //     file.path,
        //   ]);
        // } else {
        //   const reader = new FileReader();
        //   reader.onload = event => {
        //     this.props.minifyBuffer(event.target.result);
        //   };
        //   reader.readAsDataURL(file);
        // }
      }
    }
  }
  handleProcess = async () => {
    const { currentProcessor } = this.state;
    const options = this.processorRef[currentProcessor].getFieldsValue();
    const { originalImage } = this.props;
    try {
      this.setState({
        processing: true,
      });
      await this.props.minify(
        [
          originalImage.get('path'),
        ],
        currentProcessor,
        options
      );
      notification.success({
        message: '处理成功',
      });
    } catch (e) {
      notification.error({
        message: '操作失败',
        description: e.message,
      });
    }
    this.setState({
      processing: false,
    });
  }
  showIndicator = () => {
    this.setState({
      indicatorVisible: true,
    });
  }
  hideIndicator = () => {
    this.setState({
      indicatorVisible: false,
    });
  }
  moveIndicator = e => {
    const rect = this.previewFigure.getBoundingClientRect();
    this.setState({
      indicatorLeft: e.clientX - rect.left,
    });
  }
  handleChangeProcessor = activeKey => {
    this.setState({
      currentProcessor: activeKey,
    });
  }
  handleSaveFile = () => {
    const { originalImage, processedImage } = this.props;
    const url = processedImage.get('url');
    const node = document.createElement('a');
    const originalFileName = originalImage.get('name');
    const downloadFileName = `${originalFileName.replace(/\.[^.]*$/, '')}.optimized.${processedImage.get('ext')}`;
    node.setAttribute('href', url);
    node.setAttribute('download', downloadFileName);
    node.click();
  }
  handleRemoveImage = () => {
    this.props.removeFile();
  }
  renderPreview() {
    const { indicatorLeft, processing } = this.state;
    const { originalImage, processedImage } = this.props;
    const url = processedImage.get('url');
    const hasPreview = !!url;
    const originalImageStyle = {
    };
    if (hasPreview) {
      Object.assign(originalImageStyle, {
        clipPath: `inset(0 calc(100% - ${indicatorLeft}px) 0 0)`,
      });
    }
    return (
      <div className={styles.ImageProcess__Preview}>
        <figure
          ref={node => this.previewFigure = node}
          className={styles.ImageProcess__PreviewWrap}
          onMouseEnter={this.showIndicator}
          onMouseLeave={this.hideIndicator}
          onMouseMove={this.moveIndicator}
        >
          <img
            className={classnames(
              styles.ImageProcess__PreviewImage,
              styles['ImageProcess__PreviewImage--processed'],
              {
                [styles['ImageProcess__PreviewImage--hide']]: !hasPreview,
              }
            )}
            src={url}
            alt=""
          />
          <img
            style={originalImageStyle}
            className={classnames(
              styles.ImageProcess__PreviewImage,
              styles['ImageProcess__PreviewImage--original'],
            )}
            src={originalImage.get('url')}
            alt=""
          />
          <span
            style={{ left: `${indicatorLeft}px` }}
            className={
              classnames(
                styles.ImageProcess__PreviewIndicator,
                {
                  [styles['ImageProcess__PreviewIndicator--hide']]: !hasPreview,
                }
              )
            }
          />
          <span className={classnames(
            styles.ImageProcess__PreviewLabel,
            styles['ImageProcess__PreviewLabel--original'],
          )}>
            压缩前: {filesize(originalImage.get('size', 0), { base: 10 })}
          </span>
          <span className={classnames(
            styles.ImageProcess__PreviewLabel,
            styles['ImageProcess__PreviewLabel--processed'],
            {
              [styles['ImageProcess__PreviewLabel--hide']]: !hasPreview,
            },
          )}>
            压缩后: {filesize(processedImage.get('size', 0), { base: 10 })}
          </span>
          <button
            className={styles.ImageProcess__RemovePreviewBtn}
            type="button"
            onClick={this.handleRemoveImage}
          >
            <Icon type="delete" />
          </button>
        </figure>
        <h3 className={styles.ImageProcess__ImageName}>
          {originalImage.get('name')}
        </h3>
        <div className={styles.ImageProcess__PreviewAction}>
          <Button
            onClick={this.handleProcess}
            type="primary"
            loading={processing}
          >优化</Button>
          {
            url && (
              <Button
                icon="download"
                type="outline"
                loading={processing}
                onClick={this.handleSaveFile}
              >下载</Button>
            )
          }
        </div>
      </div>
    );
  }
  renderProcessorPane() {
    const { currentProcessor, availableProcessors } = this.state;
    return (
      <Fragment>
        <Tabs
          activeKey={currentProcessor}
          onChange={this.handleChangeProcessor}
          className={styles.Processor__Tabs}
        >
          { availableProcessors.map(Processor => (
            <TabPane
              key={Processor.processorName}
              tab={Processor.processorName}
            >
              <Processor ref={instance => this.processorRef[Processor.processorName] = instance} />
            </TabPane>
          )) }
        </Tabs>
      </Fragment>
    );
  }
  renderUploadZone() {
    return (
      <div>
        <UploadZone
          onChange={this.handleChangeImage}
          multiple={false}
        />
      </div>
    );
  }
  render() {
    const { originalImage } = this.props;
    let content;
    if (originalImage.size > 0) {
      content = [
        <Col key="preview" xs={24} md={10} lg={10} xxl={8}>
          { this.renderPreview() }
        </Col>,
        <Col key="editor" xs={24} md={14} lg={14} xxl={16}>
          { this.renderProcessorPane() }
        </Col>,
      ];
    } else {
      content = (
        <Col xs={24}>
          { this.renderUploadZone() }
        </Col>
      );
    }
    return (
      <section className={styles.ImageProcess}>
        <Row type="flex" gutter={12} className={styles.ImageProcess__Row}>
          { content }
        </Row>
      </section>
    );
  }
}

const pageSelector = state => state['page.image.process'];
const mapStateToProps = (state) => createSelector(
  pageSelector,
  pageState => ({
    originalImage: pageState.get('originalImage', Map()),
    processedImage: pageState.get('processedImage', Map()),
  }),
);

const mapDispatchToProps = dispatch => ({
  addFile: file => dispatch(actions.add(file)),
  removeFile: () => dispatch(actions.remove()),
  minify: (input, plugin, options) => dispatch(actions.minify(input, plugin, options)),
  minifyBuffer: buffer => dispatch(actions.minifyBuffer(buffer)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImageProcess);
