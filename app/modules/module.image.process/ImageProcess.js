import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { Map } from 'immutable';
import { Row, Col, Button, Tabs, notification } from 'antd';
import classnames from 'classnames';
import filesize from 'filesize';
import UploadZone from '../../components/component.uploadZone/';
import Pngquant from './processors/Pngquant';
import Gifsicle from './processors/Gifsicle';
import Mozjpeg from './processors/Mozjpeg';
import Webp from './processors/Webp';
import Gif2webp from './processors/Gif2webp';
import { actions } from './store';

import styles from './index.less';

const TabPane = Tabs.TabPane;

function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
  let byteCharacters = atob(b64Data);
  let byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    let slice = byteCharacters.slice(offset, offset + sliceSize);

    let byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    let byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}


const PROCESSOR_MAP = new window.Map([
  ['image/gif', [Gifsicle, Gif2webp]],
  ['image/jpeg', [Mozjpeg]],
  ['image/png', [Pngquant]],
  ['image/webp', [Webp]],
]);

class ImageProcess extends PureComponent {
  static propTypes = {
    addFile: PropTypes.func,
    minify: PropTypes.func,
    minifyBuffer: PropTypes.func,
    originalImage: PropTypes.instanceOf(Map),
    processedImage: PropTypes.instanceOf(Map),
  };
  static getDerivedStateFromProps(props, state) {
    if (props.originalImage.equals(state.originalImage)) return;
    const availableProcessors = PROCESSOR_MAP.get(props.originalImage.get('type'), []);
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
  componentDidMount() {
    const rect = this.previewFigure.getBoundingClientRect();
    this.setState({
      indicatorLeft: rect.width / 2,
    });
  }
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
    // console.log(options);
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
    const node = document.createElement('a');
    const originalFileName = originalImage.get('name');
    const downloadFileName = `${originalFileName.replace(/\.[^.]*$/, '')}.optimized.${processedImage.get('ext')}`;
    const blob = b64toBlob(
      processedImage.get('base64'),
      processedImage.get('type'),
    );
    const blobUrl = URL.createObjectURL(blob);
    node.setAttribute('href', blobUrl);
    node.setAttribute('download', downloadFileName);
    node.click();
  }
  renderPreview() {
    const { indicatorLeft, processing } = this.state;
    const { originalImage, processedImage } = this.props;
    const processedImageUrl = processedImage.get('url');
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
            )}
            src={processedImageUrl}
            alt=""
          />
          <img
            style={{ clipPath: `inset(0 calc(100% - ${indicatorLeft}px) 0 0)` }}
            className={classnames(
              styles.ImageProcess__PreviewImage,
              styles['ImageProcess__PreviewImage--original'],
            )}
            src={originalImage.get('url')}
            alt=""
            data-size={originalImage.get('size')}
          />
          <span
            style={{ left: `${indicatorLeft}px` }}
            className={
              classnames(styles.ImageProcess__PreviewIndicator)
            }
          />
          <span className={classnames(
            styles.ImageProcess__PreviewLabel,
            styles['ImageProcess__PreviewLabel--original'],
          )}>
            压缩前: {filesize(originalImage.get('size'), { base: 10 })}
          </span>
          <span className={classnames(
            styles.ImageProcess__PreviewLabel,
            styles['ImageProcess__PreviewLabel--processed'],
          )}>
            压缩后: {filesize(processedImage.get('size'), { base: 10 })}
          </span>
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
            processedImageUrl && (
              <Button
                icon="download"
                type="outline"
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
  render() {
    return (
      <section>
        <Row type="flex" gutter={12}>
          <Col md={10} lg={8} xxl={4}>
            { this.renderPreview() }
          </Col>
          <Col md={14} lg={16} xxl={20}>
            { this.renderProcessorPane() }
          </Col>
        </Row>
        <UploadZone
          onChange={this.handleChangeImage}
          multiple={false}
        />
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
  minify: (input, plugin, options) => dispatch(actions.minify(input, plugin, options)),
  minifyBuffer: buffer => dispatch(actions.minifyBuffer(buffer)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImageProcess);
