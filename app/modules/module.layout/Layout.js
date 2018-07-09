/**
 * Layout Module
 * @author ryan.bian
 */
import { shell } from 'electron';
import { Layout, Modal } from 'antd';
import PropTypes from 'prop-types';
import { Component } from 'react';
import classnames from 'classnames';
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
    location: PropTypes.object,
    navigate: PropTypes.func,
  }
  state = {
    infoModalVisible: false,
  }
  static getPageInfo(pathname) {
    const matched = GLOBAL_NAV_CONFIG.find(d => `/${d.to}` === pathname);
    if (matched) return matched;
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
    const { location, navigate, children } = this.props;
    const layoutProps = {
      padding: 0,
      hasContent: true,
    };
    const pageInfo = LayoutModule.getPageInfo(location.pathname);
    if (pageInfo) {
      Object.assign(layoutProps, {
        title: pageInfo.text,
        icon: pageInfo.icon,
      });
    } else {
      Object.assign(layoutProps, {
        hasContent: false,
      });
    }
    return (
      <Layout className={PLATFORM} style={{ height: '100vh' }}>
        <SiderBar
          current={pageInfo ? pageInfo.to : null}
          showInfo={this.showAppInfo}
          navigate={navigate}
        />
        <LayoutComponent key="layout" {...layoutProps}>
          {children}
        </LayoutComponent>
        <ConsoleModule className={classnames(styles['Layout__Console'], {
          [styles['Layout__Console--visible']]: pageInfo && (pageInfo.to === 'project'),
        })} />
        { this.renderInfo() }
      </Layout>
    );
  }
}


export default LayoutModule;
