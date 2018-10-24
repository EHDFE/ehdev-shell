/**
 * Info Modal
 * @author ryan.bian
 */
import { shell } from 'electron';
import { PureComponent } from 'react';
import { Modal, Button, Progress, Alert } from 'antd';
import PropTypes from 'prop-types';
import AppIconPath from '../../../resources/icons/128x128.png';
import pkg from '../../package.json';
import {
  UPDATE_NOT_CHECKED,
  UPDATE_CHECKING,
  UPDATE_AVAILABLE,
  UPDATE_NOT_AVAILABLE,
  UPDATE_DOWNLOADING,
  UPDATE_DOWNLOADED,
  UPDATE_DOWNLOAD_ERROR,
} from './STATUS';
import updater from '../../apis/updater';

import styles from './index.less';

export default class InfoModal extends PureComponent {
  static defaultProps = {
    status: UPDATE_NOT_CHECKED,
    open: false,
    onClose() {},
    onRequestCheckUpdate() {},
    onRequestDownload() {},
    onRequestInstall() {},
    percent: 0,
  };
  static propTypes = {
    status: PropTypes.oneOf([
      UPDATE_NOT_CHECKED,
      UPDATE_CHECKING,
      UPDATE_AVAILABLE,
      UPDATE_NOT_AVAILABLE,
      UPDATE_DOWNLOADING,
      UPDATE_DOWNLOADED,
      UPDATE_DOWNLOAD_ERROR,
    ]),
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onRequestCheckUpdate: PropTypes.func,
    onRequestDownload: PropTypes.func,
    onRequestInstall: PropTypes.func,
    percent: PropTypes.number,
  };
  handleOpenExternal = e => {
    e.preventDefault();
    shell.openExternal(e.currentTarget.getAttribute('href'));
  };
  onCheckUpdate = () => {
    if (this.props.status === UPDATE_CHECKING) return;
    this.props.onRequestCheckUpdate();
  };
  renderUpdateCtrls() {
    const { status } = this.props;
    const content = [];
    switch (status) {
      case UPDATE_NOT_CHECKED:
      case UPDATE_CHECKING:
      case UPDATE_NOT_AVAILABLE:
        content.push(
          <Button
            key="checkUpdate"
            onClick={this.onCheckUpdate}
            loading={status === UPDATE_CHECKING}
          >
            Check Update
          </Button>,
        );
        break;
      case UPDATE_AVAILABLE:
      case UPDATE_DOWNLOAD_ERROR:
        content.push(
          <Button
            key="download"
            onClick={this.props.onRequestDownload}
            loading={status === UPDATE_CHECKING}
          >
            Download New Release
          </Button>,
        );
        if (status === UPDATE_DOWNLOAD_ERROR) {
          const version =
            updater.autoUpdater.updateInfo &&
            updater.autoUpdater.updateInfo.version;
          const downloadLink = version ? (
            <a
              key="link"
              href={`https://github.com/EHDFE/ehdev-shell/releases/tag/v${version}`}
              onClick={this.handleOpenExternal}
            >
              更新
            </a>
          ) : (
            <a
              key="link"
              href={'https://github.com/EHDFE/ehdev-shell/releases'}
              onClick={this.handleOpenExternal}
            >
              更新
            </a>
          );
          const tip = ['下载失败，建议前往官网下载', downloadLink];
          content.push(
            <Alert
              key="alert"
              type="warning"
              message={tip}
              showIcon
              style={{ marginTop: 10 }}
            />,
          );
        }
        break;
      case UPDATE_DOWNLOADING:
        content.push(
          <Button key="downloading" loading={true}>
            Downloading
          </Button>,
          <Progress key="progress" percent={this.props.percent} />,
        );
        break;
      case UPDATE_DOWNLOADED:
        content.push(
          <Button key="install" onClick={this.props.onRequestInstall}>
            Install
          </Button>,
        );
        break;
    }
    return <div>{content}</div>;
  }
  render() {
    const modalProps = {
      visible: this.props.open,
      footer: null,
      onCancel: () => {
        this.props.onClose();
      },
    };
    return (
      <Modal {...modalProps}>
        <section className={styles.Info__Content}>
          <picture>
            <img src={AppIconPath} alt="Jarvis" width="64" height="64" />
          </picture>
          <h2>Jarvis</h2>
          <p>
            版本：
            {pkg.version} ({process.env.BUILD_TIME})
          </p>
          <p>
            Release Notes：
            <a
              href={`https://github.com/EHDFE/ehdev-shell/releases/tag/v${
                pkg.version
              }`}
              onClick={this.handleOpenExternal}
            >
              {`v${pkg.version}`}
            </a>
          </p>
          <p>
            File Bug：
            <a
              href="https://github.com/EHDFE/ehdev-shell/issues"
              onClick={this.handleOpenExternal}
            >
              issues
            </a>
          </p>
          {this.renderUpdateCtrls()}
        </section>
      </Modal>
    );
  }
}
