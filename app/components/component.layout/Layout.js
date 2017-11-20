/**
 * Layout Component
 * @author ryan.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd/es/';
import StackBlur from 'stackblur-canvas';

import SiderBar from '../component.siderBar/';
import styles from './index.less';

const { Content } = Layout;

const url = 'http://static.statickksmg.com/image/2014/04/19/46755cb10199104065bdd986e105280f.jpg';

export default class LayoutComponent extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array,
    ]),
  }
  componentDidMount() {
    this.ctx = this.canvas.getContext('2d');
    const rect = this.canvas.getBoundingClientRect();
    const image = new Image();
    const width = rect.width;
    const height = rect.height;
    this.canvas.width = width;
    this.canvas.height = height;
    image.onload = () => {
      this.ctx.drawImage(image, 16, 16, width - 32, height - 32, 0, 0, width, height);
      // const imageData = this.ctx.getImageData(0, 0, width, height);
      StackBlur.canvasRGB(this.canvas, 0, 0, width, height, 50);
    };
    image.crossOrigin = 'anonymous';
    image.src = url;
  }
  render() {
    const layoutStyle = {
      backgroundImage: `url(${url})`,
      backgroundRepeat: 'no-repeat',
      // backgroundAttachment: 'fixed',
    };
    return (
      <Layout style={{ height: '100vh' }}>
        <SiderBar />
        <Layout
          className={styles.Layout}
          style={layoutStyle}
        >
          { this.props.children || null }
          <canvas
            ref={node => this.canvas = node}
            className={styles.Layout__Canvas}
          />
        </Layout>
      </Layout>
    );
  }
}
