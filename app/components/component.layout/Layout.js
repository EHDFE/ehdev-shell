/**
 * Layout Component
 * @author ryan.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd/es/';

import SiderBar from '../component.siderBar/';

const { Content } = Layout;

export default class LayoutComponent extends Component {
  static propTypes = {
    children: PropTypes.element,
  }
  render() {
    return (
      <Layout style={{ height: '100vh' }}>
        <SiderBar />
        <Layout>
          <Content style={{
            padding: 16,
            backgroundColor: '#fff',
          }}>
            { this.props.children || null }
          </Content>
        </Layout>
      </Layout>
    );
  }
}
