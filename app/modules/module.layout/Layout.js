/**
 * Layout Module
 * @author ryan.bian
 */
import Raven from 'raven-js';
import { Layout } from 'antd';
import PropTypes from 'prop-types';
import { Component } from 'react';
import classnames from 'classnames';
import { GLOBAL_NAV_CONFIG } from '../../CONFIG';
import LayoutComponent from '../../components/component.layout/';
import SiderBar from '../../components/component.siderBar/';
import InfoModal from '../../components/component.infoModal/';
import ConsoleModule from '../module.console/';
import { platform } from 'os';
import updater from '../../apis/updater';
import {
  UPDATE_NOT_CHECKED,
  UPDATE_CHECKING,
  UPDATE_AVAILABLE,
  UPDATE_NOT_AVAILABLE,
  UPDATE_DOWNLOADING,
  UPDATE_DOWNLOADED,
  UPDATE_DOWNLOAD_ERROR,
} from '../../components/component.infoModal/STATUS';
import styles from './index.less';

const PLATFORM = platform();

class LayoutModule extends Component {
  static propTypes = {
    children: PropTypes.any,
    location: PropTypes.object,
    navigate: PropTypes.func,
  }
  state = {
    infoModalVisible: false,
    status: UPDATE_NOT_CHECKED,
    downloadProgress: 0,
  }
  static getPageInfo(pathname) {
    const matched = GLOBAL_NAV_CONFIG.find(d => `/${d.to}` === pathname);
    if (matched) return matched;
    return null;
  }
  componentDidMount() {
    updater.autoUpdater.on('error', error => {
      Raven.captureException(error, {
        logger: 'autoUpdater',
      });
      this.setState({
        status: UPDATE_DOWNLOAD_ERROR,
      });
    });
    updater.autoUpdater.on('checking-for-update', () => {
      this.setState({
        status: UPDATE_CHECKING,
      });
    });
    updater.autoUpdater.on('update-available', info => {
      this.setState({
        status: UPDATE_AVAILABLE,
      });
    });
    updater.autoUpdater.on('update-not-available', info => {
      this.setState({
        status: UPDATE_NOT_AVAILABLE,
      });
    });
    updater.autoUpdater.on('download-progress', progress => {
      this.setState({
        status: UPDATE_DOWNLOADING,
        downloadProgress: Math.round(progress.percent * 10) / 10,
      });
    });
    updater.autoUpdater.on('update-downloaded', info => {
      this.setState({
        status: UPDATE_DOWNLOADED,
      });
    });
    updater.checkForUpdate();
  }
  showAppInfo = () => {
    this.setState({
      infoModalVisible: true,
    });
  }
  render() {
    const { status, downloadProgress } = this.state;
    const { location, navigate, children } = this.props;
    const layoutProps = {
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
          status={status}
        />
        <LayoutComponent key="layout" {...layoutProps}>
          {children}
        </LayoutComponent>
        <ConsoleModule className={classnames(styles['Layout__Console'], {
          [styles['Layout__Console--visible']]: pageInfo && (pageInfo.to === 'project'),
        })} />
        <InfoModal
          status={status}
          open={this.state.infoModalVisible}
          percent={downloadProgress}
          onClose={() => {
            this.setState({
              infoModalVisible: false,
            });
          }}
          onRequestCheckUpdate={() => {
            updater.checkForUpdate();
          }}
          onRequestDownload={() => {
            updater.downloadUpdate();
          }}
          onRequestInstall={() => {
            updater.install();
          }}
        />
      </Layout>
    );
  }
}


export default LayoutModule;
