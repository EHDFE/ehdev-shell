/**
 * Layout Module
 * @author ryan.bian
 */
import { Layout } from 'antd';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { GLOBAL_NAV_CONFIG } from '../../CONFIG';
import LayoutComponent from '../../components/component.layout/';
import SiderBar from '../../components/component.siderBar/';
import ConsoleModule from '../module.console/';
// import styles from './index.less';

class LayoutModule extends Component {
  static propTypes = {
    children: PropTypes.any,
    location: PropTypes.object.isRequired,
  }
  state = {
    nav: this.getLayoutNav(this.props.location),
  }
  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.location, this.props.location)) {
      this.setState({
        nav: this.getLayoutNav(nextProps.location),
      });
    }
  }
  getLayoutNav(location) {
    const { pathname } = location;
    const matched = GLOBAL_NAV_CONFIG.find(d => d.to === pathname);
    if (matched) {
      return matched;
    }
    return null;
  }
  render() {
    const { location, children } = this.props;
    const { nav } = this.state;
    const { pathname } = location;
    const layoutProps = {
      padding: 0,
      hasContent: true,
    };
    if (nav && nav.text) {
      Object.assign(layoutProps, {
        title: nav.text,
        icon: nav.icon,
      });
    }
    if (pathname === '/' || pathname === '/dashboard') {
      Object.assign(layoutProps, {
        hasContent: false,
      });
    }
    return (
      <Layout style={{ height: '100vh' }}>
        <SiderBar />
        <LayoutComponent key="layout" {...layoutProps}>
          {children}
        </LayoutComponent>
        <ConsoleModule />
      </Layout>
    );
  }
}


export default withRouter(LayoutModule);
