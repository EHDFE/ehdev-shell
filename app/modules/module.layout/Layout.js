/**
 * Layout Module
 * @author ryan.bian
 */
import { shell } from 'electron';
import { Layout, Modal } from 'antd';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { GLOBAL_NAV_CONFIG } from '../../CONFIG';
import LayoutComponent from '../../components/component.layout/';
import SiderBar from '../../components/component.siderBar/';
import ConsoleModule from '../module.console/';
import { platform } from 'os';
import pkg from '../../package.json';
import styles from './index.less';
import AppIconPath from '../../../resources/icons/128x128.png';

const PLATFORM = platform();

class LayoutModule extends Component {
  static propTypes = {
    children: PropTypes.any,
    location: PropTypes.object.isRequired,
  }
  state = {
    nav: LayoutModule.getLayoutNav(this.props.location),
    infoModalVisible: false,
  }
  static getDerivedStateFromProps(props, state) {
    return {
      nav: LayoutModule.getLayoutNav(props.location),
    };
  }
  static getLayoutNav(location) {
    const { pathname } = location;
    const matched = GLOBAL_NAV_CONFIG.find(d => d.to === pathname);
    if (matched) {
      return matched;
    }
    return null;
  }
  showAppInfo = () => {
    this.setState({
      infoModalVisible: true,
    });
  }
  handleOpenExternal(e) {
    e.preventDefault();
    shell.openExternal(e.currentTarget.getAttribute('href'));
  }
  renderInfo() {
    const modalProps = {
      visible: this.state.infoModalVisible,
      footer: null,
      onCancel: () => {
        this.setState({
          infoModalVisible: false,
        });
      },
    };
    return (
      <Modal {...modalProps}>
        <section className={styles.Layout__InfoContent}>
          <picture>
            <img src={AppIconPath} alt="Jarvis" width="64" height="64" />
          </picture>
          <h2>Jarvis</h2>
          <p>版本：{pkg.version} ({process.env.BUILD_TIME})</p>
          <p>
            Release Notes：
            <a href={`https://github.com/EHDFE/ehdev-shell/releases/tag/v${pkg.version}`} onClick={this.handleOpenExternal}>
              {`v${pkg.version}`}
            </a>
          </p>
          <p>
            File Bug：
            <a href="https://github.com/EHDFE/ehdev-shell/issues" onClick={this.handleOpenExternal}>issues</a>
          </p>
        </section>
      </Modal>
    );
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
      <Layout className={PLATFORM} style={{ height: '100vh' }}>
        <SiderBar showInfo={this.showAppInfo} />
        <LayoutComponent key="layout" {...layoutProps}>
          {children}
        </LayoutComponent>
        <ConsoleModule />
        { this.renderInfo() }
      </Layout>
    );
  }
}


export default withRouter(LayoutModule);
