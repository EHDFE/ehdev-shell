/**
 * Layout Component
 * @author ryan.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd/es/';

import SiderBar from '../component.siderBar/';
import styles from './index.less';

const { Content } = Layout;

export default class LayoutComponent extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array,
    ]),
  }
  render() {
    return (
      <Layout style={{ height: '100vh' }}>
        <SiderBar />
        <Layout>
          <Content>
            { this.props.children || null }
          </Content>
        </Layout>
      </Layout>
    );
  }
}
