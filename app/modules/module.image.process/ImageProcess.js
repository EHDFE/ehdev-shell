import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { Map } from 'immutable';
import { Row, Col, Button } from 'antd';
import classnames from 'classnames';
import filesize from 'filesize';
import UploadZone from '../../components/component.uploadZone/';
import Pngquant from './processors/Pngquant';
import { actions } from './store';

import styles from './index.less';

class ImageProcess extends PureComponent {
  static propTypes = {
    addFile: PropTypes.func,
    minify: PropTypes.func,
    minifyBuffer: PropTypes.func,
    originalImage: PropTypes.instanceOf(Map),
    processedImage: PropTypes.instanceOf(Map),
  };
  state = {
    indicatorLeft: 0,
  }
  componentDidMount() {
    this.processorRef = createRef();
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
  handleProcess = () => {
    const options = this.processorRef.current.getFieldsValue();
    const { originalImage } = this.props;
    // console.log(options);
    this.props.minify([
      originalImage.get('path'),
    ], 'pngquant', options);
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
  renderPreview() {
    const { indicatorLeft } = this.state;
    const { originalImage, processedImage } = this.props;
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
            src={processedImage.get('url')}
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
        <Button onClick={this.handleProcess} type="primary">压缩</Button>
      </div>
    );
  }
  renderProcessorPane() {
    return <Pngquant ref={this.processorRef} />;
  }
  render() {
    return (
      <section>
        <Row type="flex">
          <Col md={8} lg={6} xl={4} xxl={2}>
            { this.renderPreview() }
          </Col>
          <Col md={16} lg={18} xl={20} xxl={22}>
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
