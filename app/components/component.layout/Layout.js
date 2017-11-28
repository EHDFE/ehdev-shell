/**
 * Layout Component
 * @author ryan.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Layout, Icon } from 'antd';
import StackBlur from 'stackblur-canvas';
import tinycolor from 'tinycolor2';
import throttle from 'lodash/throttle';
import pick from 'lodash/pick';
import isEqual from 'lodash/isEqual';

import styles from './index.less';

export default class LayoutComponent extends Component {
  static defaultProps = {
    title: '',
    icon: '',
    padding: 16,
    backgroundUrl: '',
    tintColor: '#fff',
    tintOpacity: 0.4,
    blurSize: 40,
    previewMode: false,
    hasContent: true,
  }
  static propTypes = {
    title: PropTypes.string,
    icon: PropTypes.string,
    padding: PropTypes.number,
    backgroundUrl: PropTypes.string.isRequired,
    tintColor: PropTypes.string,
    tintOpacity: PropTypes.number,
    blurSize: PropTypes.number,
    previewMode: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array,
    ]),
    hasContent: PropTypes.bool,
  }
  static getScaleSize(imageWidth, imageHeight, targetWidth, targetHeight) {
    let scaleWidth, scaleHeight;

    const ratio = imageWidth / imageHeight;
    if ((targetWidth / targetHeight) > ratio) {
      // image's w/h ratio is smaller than container's
      // scale the image's width to match the container's width
      scaleWidth = targetWidth;
      scaleHeight = scaleWidth / ratio;
    } else {
      // image's w/h ratio is larger than container's
      // scale the image's height to match the container's height
      scaleHeight = targetHeight;
      scaleWidth = ratio * scaleHeight;
    }
    return {
      scaleWidth,
      scaleHeight,
    };
  }
  state = {
    scaleWidth: undefined,
    scaleHeight: undefined,
    blurUrl: undefined,
    minHeader: false,
  }
  componentDidMount() {
    window.addEventListener('resize', this.handleResize, false);
    this.loadBackgrounds(this.props);
  }
  componentWillReceiveProps(nextProps) {
    const pickList = ['backgroundUrl', 'blurSize', 'tintColor', 'tintOpacity'];
    const curList = pick(this.props, pickList);
    const nextList = pick(nextProps, pickList);
    if (!isEqual(curList, nextList)) {
      this.loadBackgrounds(nextProps);
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false);
  }
  handleResize = throttle(() => {
    const rect = this.wrapper.getBoundingClientRect();
    const { imageWidth, imageHeight } = this.state;
    const cw = rect.width;
    const ch = window.innerHeight;
    const { scaleWidth, scaleHeight } = LayoutComponent.getScaleSize(
      imageWidth, imageHeight,
      cw, ch,
    );
    this.setState({
      scaleWidth,
      scaleHeight,
    });
  }, 250)
  loadBackgrounds(props) {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
    const { backgroundUrl, tintColor, tintOpacity, blurSize } = props;
    const rect = this.wrapper.getBoundingClientRect();
    const cw = rect.width;
    const ch = window.innerHeight;
    const image = new Image();
    image.onload = e => {
      const nw = image.naturalWidth;
      const nh = image.naturalHeight;
      const { scaleWidth, scaleHeight } = LayoutComponent.getScaleSize(
        nw, nh,
        cw, ch,
      );
      this.canvas.width = nw;
      this.canvas.height = nh;
      this.ctx.drawImage(image, 0, 0, nw, nh);
      StackBlur.canvasRGBA(this.canvas, 0, 0, nw, nh, blurSize);

      this.ctx.fillStyle = tinycolor(tintColor).setAlpha(tintOpacity).toRgbString();
      this.ctx.fillRect(0, 0, nw, nh);

      this.canvas.toBlob(blob => {
        const blurUrl = URL.createObjectURL(blob);
        this.setState({
          blurUrl,
          scaleWidth,
          scaleHeight,
          imageWidth: nw,
          imageHeight: nh,
        });
      });
    };
    image.src = backgroundUrl;
  }
  renderLayoutHead() {
    const { title, icon } = this.props;
    const { minHeader } = this.state;
    return title ? (
      <header
        className={classnames(
          styles.Layout__Header,
          {
            [styles['Layout__Header--min']]: minHeader,
          }
        )}
      >
        <Icon
          className={styles.Layout__HeaderIcon}
          type={icon}
          style={{
            fontSize: 36,
          }}
        />
        <h1 className={styles.Layout__HeaderTitle}>{title}</h1>
      </header>
    ) : null;
  }
  renderContent() {
    const { hasContent } = this.props;
    const content = this.props.children || null;
    return hasContent ? (
      <div className={styles.Layout__Content}>
        { content }
      </div>
    ) : content;
  }
  render() {
    const { padding, backgroundUrl, previewMode } = this.props;
    const { blurUrl, scaleWidth, scaleHeight } = this.state;
    const layoutStyle = {
      padding,
      backgroundImage: `url(${backgroundUrl})`,
    };
    const wrapperStyle = {
      width: `calc(100vw - 80px - ${padding * 2}px)`,
      minHeight: `calc(100vh - ${padding * 2}px)`,
    };
    if (blurUrl) {
      Object.assign(wrapperStyle, {
        backgroundImage: `url(${blurUrl})`,
        backgroundSize: `${scaleWidth}px ${scaleHeight}px`,
      });
    }
    return (
      <Layout>
        <div
          className={styles.Layout}
          style={layoutStyle}
          ref={node => this.wrapper = node}
        >
          <main
            style={wrapperStyle}
            className={
              classnames(
                styles.Layout__Wrapper,
                {
                  [styles['Layout__Wrapper--viewMode']]: previewMode,
                },
              )
            }>
            { this.renderLayoutHead() }
            { this.renderContent() }
          </main>
        </div>
      </Layout>
    );
  }
}
