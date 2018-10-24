/**
 * Folder Picker
 * @description pick folder
 * @author ryan.bian
 */
import electron from 'electron';
import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Popover, notification, Icon } from 'antd';
import RepoIcon from 'react-icons/lib/go/repo';
import PlusIcon from 'react-icons/lib/go/plus';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { shell } from 'electron';

import styles from './index.less';

const { dialog } = electron.remote;

export default class FolderPicker extends Component {
  static defaultProps = {
    value: '',
    onChange() {},
    children: undefined,
  };
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    children: PropTypes.any,
  };
  handleClick = () => {
    dialog.showOpenDialog(
      {
        properties: ['openDirectory'],
      },
      filePaths => {
        if (Array.isArray(filePaths)) {
          this.props.onChange(filePaths[0]);
        }
      },
    );
  };
  openFileExplorer = () => {
    const { value } = this.props;
    shell.showItemInFolder(value);
  };
  renderContent() {
    const { value, children } = this.props;
    const menuItems = [
      <CopyToClipboard
        text={value}
        key="copy"
        onCopy={() => {
          notification.success({
            message: '复制成功',
          });
        }}
      >
        <button className={styles.FolderPicker__PopoverButton}>复制路径</button>
      </CopyToClipboard>,
      <button
        className={styles.FolderPicker__PopoverButton}
        key="open"
        onClick={this.openFileExplorer}
      >
        打开目录
      </button>,
      <button
        className={styles.FolderPicker__PopoverButton}
        onClick={this.handleClick}
        key="change"
      >
        切换项目
      </button>,
    ];
    return (
      <Popover
        placement={'bottomLeft'}
        title={'快捷操作'}
        content={
          <div className={styles.FolderPicker__Popover}>{menuItems}</div>
        }
      >
        {children}
      </Popover>
    );
  }
  render() {
    const { value } = this.props;
    return (
      <div className={styles.FolderPicker}>
        <RepoIcon size={26} />
        {!value ? (
          <button
            className={styles.FolderPicker__AddButton}
            onClick={this.handleClick}
          >
            <PlusIcon size={26} />
          </button>
        ) : (
          <Fragment>
            {this.renderContent()}
            <button
              className={styles.FolderPicker__Icon}
              onClick={this.handleClick}
            >
              <Icon type="reload" />
            </button>
          </Fragment>
        )}
      </div>
    );
  }
}
