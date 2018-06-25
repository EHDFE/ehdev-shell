import { PureComponent, Fragment } from 'react';
import { Map } from 'immutable';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import filesize from 'filesize';
import { Button, Dropdown, Icon, Menu } from 'antd';

import styles from './index.less';

export default class Preview extends PureComponent {
  static propTypes = {
    data: PropTypes.instanceOf(Map),
    processing: PropTypes.bool,
    current: PropTypes.string,
    onRemove: PropTypes.func.isRequired,
    onStart: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    onPrev: PropTypes.func.isRequired,
    onOpenBatchProcess: PropTypes.func.isRequired,
  };
  state = {
    indicatorLeft: 0,
    indicatorVisible: false,
  };
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
  handleRemoveImage = () => {
    this.props.onRemove(this.props.current);
  }
  handleSaveFile = () => {
    const { data, current } = this.props;
    const originalImage = data.getIn([current, 'originalImage']);
    const processedImage = data.getIn([current, 'processedImage']);
    const url = processedImage.get('url');
    const node = document.createElement('a');
    const originalFileName = originalImage.get('name');
    const downloadFileName = `${originalFileName.replace(/\.[^.]*$/, '')}.optimized.${processedImage.get('ext')}`;
    node.setAttribute('href', url);
    node.setAttribute('download', downloadFileName);
    node.click();
  }
  handleProcess = () => {
    this.props.onStart();
  }
  handleBackwardJump = () => {
    this.props.onPrev();
  }
  handleForwardJump = () => {
    this.props.onNext();
  }
  handleAdvanceMenuClick = e => {
    if (e.key === 'batchProcess') {
      this.props.onOpenBatchProcess();
    }
  }
  renderButtons(url) {
    const { data, processing } = this.props;
    let processbtn = (
      <Button
        onClick={this.handleProcess}
        type="primary"
        loading={processing}
      >处理</Button>
    );
    const downloadBtn = (
      <Button
        icon="download"
        type="outline"
        loading={processing}
        onClick={this.handleSaveFile}
      >下载</Button>
    );
    if (data.size > 1) {
      const menu = (
        <Menu onClick={this.handleAdvanceMenuClick}>
          <Menu.Item key="batchProcess">批量处理</Menu.Item>
        </Menu>
      );
      processbtn = (
        <Dropdown
          overlay={menu}
          placement="topLeft"
        >{processbtn}</Dropdown>
      );
    }
    return (
      <div className={styles.ImageProcess__PreviewAction}>
        { processbtn }
        { url && downloadBtn }
      </div>
    );
  }
  renderController(name, url) {
    const { data } = this.props;
    const multipleImages = data.size > 1;
    return (
      <Fragment>
        <div className={styles.ImageProcess__PreviewCtrl}>
          <button
            className={
              classnames(
                styles['ImageProcess__PreviewCtrl--button'],
                styles['ImageProcess__PreviewCtrl--backward'],
                {
                  [styles['ImageProcess__PreviewCtrl--hide']]: !multipleImages,
                },
              )
            }
            onClick={this.handleBackwardJump}
          >
            <Icon type="left-circle-o" />
          </button>
          <h3 className={styles['ImageProcess__PreviewCtrl--name']}>{ name }</h3>
          <button
            className={
              classnames(
                styles['ImageProcess__PreviewCtrl--button'],
                styles['ImageProcess__PreviewCtrl--forward'],
                {
                  [styles['ImageProcess__PreviewCtrl--hide']]: !multipleImages,
                },
              )
            }
            onClick={this.handleForwardJump}
          >
            <Icon type="right-circle-o" />
          </button>
        </div>
      </Fragment>
    );
  }
  render() {
    const { indicatorLeft } = this.state;
    const { data, current } = this.props;
    const originalImage = data.getIn([current, 'originalImage']);
    const processedImage = data.getIn([current, 'processedImage']);
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
        {
          this.renderController(
            originalImage.get('name'),
            url
          )
        }
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
            处理前: {filesize(originalImage.get('size', 0), { base: 10 })}
          </span>
          <span className={classnames(
            styles.ImageProcess__PreviewLabel,
            styles['ImageProcess__PreviewLabel--processed'],
            {
              [styles['ImageProcess__PreviewLabel--hide']]: !hasPreview,
            },
          )}>
          处理后: {filesize(processedImage.get('size', 0), { base: 10 })}
          </span>
          <button
            className={styles.ImageProcess__RemovePreviewBtn}
            type="button"
            onClick={this.handleRemoveImage}
          >
            <Icon type="delete" />
          </button>
        </figure>
        { this.renderButtons(url) }
      </div>
    );
  }
}
