import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { Map } from 'immutable';
import { Button, notification, Icon, Menu, Dropdown } from 'antd';
import classnames from 'classnames';
import filesize from 'filesize';
import UploadZone from '../../components/component.uploadZone/';
import { actions } from './store';
import {
  Pngquant,
  Gifsicle,
  Mozjpeg,
  Webp,
  Guetzli,
  Zopfli,
  Svgo,
  // Upng,
} from './processorExport';
import styles from './index.less';

const PROCESSOR_MAP = new window.Map([
  ['image/gif', [Gifsicle]],
  ['image/jpeg', [Mozjpeg, Guetzli, Webp]],
  ['image/png', [Pngquant, Zopfli, Guetzli, Webp]],
  ['image/webp', [Webp]],
  ['image/svg+xml', [Svgo]],
]);

class ImageProcess extends PureComponent {
  static propTypes = {
    addFile: PropTypes.func,
    removeFile: PropTypes.func,
    minify: PropTypes.func,
    minifyBuffer: PropTypes.func,
    images: PropTypes.instanceOf(Map),
  };
  static getDerivedStateFromProps(props, state) {
    if (props.images.equals(state.images)) return null;
    const currentImage = state.currentImage && props.images.has(state.currentImage) ?
      state.currentImage : props.images.keySeq().first();
    const currentOriginalImage = props.images.getIn([currentImage, 'originalImage'], Map());
    const availableProcessors = PROCESSOR_MAP.get(currentOriginalImage.get('type')) || [];
    return {
      images: props.images,
      currentImage,
      currentProcessor: availableProcessors.length > 0 ? availableProcessors[0].processorName : null,
      availableProcessors,
    };
  }
  state = {
    indicatorLeft: 0,
    currentProcessor: null,
    availableProcessors: [],
    currentImage: null,
    images: new Map(),
    processing: false,
  }
  processorRef = {}
  componentDidUpdate() {

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
    const { currentProcessor, currentImage } = this.state;
    const options = this.processorRef[currentProcessor].getFieldsValue();
    try {
      this.setState({
        processing: true,
      });
      await this.props.minify(
        currentImage,
        currentProcessor,
        options,
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
  handleChangeProcessor = ({ key }) => {
    this.setState({
      currentProcessor: key,
    });
  }
  handleSaveFile = () => {
    const { images } = this.props;
    const { currentImage } = this.state;
    const originalImage = images.getIn([currentImage, 'originalImage']);
    const processedImage = images.getIn([currentImage, 'processedImage']);
    const url = processedImage.get('url');
    const node = document.createElement('a');
    const originalFileName = originalImage.get('name');
    const downloadFileName = `${originalFileName.replace(/\.[^.]*$/, '')}.optimized.${processedImage.get('ext')}`;
    node.setAttribute('href', url);
    node.setAttribute('download', downloadFileName);
    node.click();
  }
  handleRemoveImage = () => {
    const { currentImage } = this.state;
    this.props.removeFile(currentImage);
  }
  renderPreview() {
    const { indicatorLeft, processing } = this.state;
    const { images } = this.props;
    const { currentImage } = this.state;
    const originalImage = images.getIn([currentImage, 'originalImage']);
    const processedImage = images.getIn([currentImage, 'processedImage']);
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
    const { images } = this.props;
    const { currentImage } = this.state;
    const originalImage = images.getIn([currentImage, 'originalImage']);
    const { currentProcessor, availableProcessors } = this.state;
    const menuProps = {
      onClick: this.handleChangeProcessor,
    };
    const processMenu = (
      <Menu {...menuProps}>
        {
          availableProcessors.map(Processor => (
            <Menu.Item key={Processor.processorName}>
              {Processor.processorName}
            </Menu.Item>
          ))
        }
      </Menu>
    );
    const Processor = availableProcessors.find(
      P => P.processorName === currentProcessor
    );
    return (
      <Fragment>
        <Dropdown
          overlay={processMenu}
        >
          <div className={styles.ImageProcess__ProcessorTitle}>
            <h3>{currentProcessor}</h3>
            <Icon type="ellipsis" />
          </div>
        </Dropdown>
        <Processor
          className={styles.ImageProcess__EditorWrap}
          ref={instance => this.processorRef[currentProcessor] = instance}
          data={originalImage}
        />
      </Fragment>
    );
  }
  renderUploadZone() {
    return (
      <div className={styles.ImageProcess__FilePickerZone}>
        <UploadZone
          onChange={this.handleChangeImage}
          multiple
        />
        <div className={styles.ImageProcess__FilePickerText}>
          或者
        </div>
        <Button
          size="large"
          className={styles.ImageProcess__FilePickerButton}
        >批量导入</Button>
      </div>
    );
  }
  render() {
    const { images } = this.props;
    let content;
    if (images.size > 0) {
      content = [
        <div className={styles.ImageProcess__PreviewView} key="preview">
          { this.renderPreview() }
        </div>,
        <div className={styles.ImageProcess__EditorView} key="editor">
          { this.renderProcessorPane() }
        </div>,
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
  pageState => ({
    images: pageState.get('images', Map()),
  }),
);

const mapDispatchToProps = dispatch => ({
  addFile: files => dispatch(actions.add(files)),
  removeFile: filePath => dispatch(actions.remove(filePath)),
  minify: (input, plugin, options) => dispatch(actions.minify(input, plugin, options)),
  minifyBuffer: buffer => dispatch(actions.minifyBuffer(buffer)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImageProcess);
