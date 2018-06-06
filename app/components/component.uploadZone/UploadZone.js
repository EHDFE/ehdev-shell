/**
 * Upload Zone Component
 */
import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import MdCloudUpload from 'react-icons/lib/md/cloud-upload';
import { notification } from 'antd';

import styles from './index.less';

export default class UploadZone extends Component {
  static defaultProps = {
    // 允许的上传类型
    accept: 'image/',
    onChange() {},
    multiple: true,
  }
  static propTypes = {
    accept: PropTypes.string,
    onChange: PropTypes.func,
    multiple: PropTypes.bool,
  }
  state = {
    dragIsOver: false,
  }
  constructor(props) {
    super(props);
    window.addEventListener('paste', this.handlePaste, false);
  }
  componentWillUnmount() {
    window.removeEventListener('paste', this.handlePaste, false);
  }
  handleDragEnter = e => {
    e.preventDefault();
    this.setState({
      dragIsOver: true,
    });
  }
  handleDragOver = e => {
    e.preventDefault();
  }
  handleDragLeave = e => {
    e.preventDefault();
    this.setState({
      dragIsOver: false,
    });
  }
  handleDrop = e => {
    e.preventDefault();
    const { files } = e.dataTransfer;
    this.setState({
      dragIsOver: false,
    });
    if (!this.validate(files)) return;
    this.onAddFiles(e.dataTransfer.files);
  }
  handleChangeFiles = ({ nativeEvent }) => {
    if (!this.validate(nativeEvent.target.files)) return;
    this.onAddFiles(nativeEvent.target.files);
  }
  handlePaste = ({ clipboardData }) => {
    if (clipboardData && clipboardData.files) {
      if (!this.validate(clipboardData.files)) return;
      this.onAddFiles(clipboardData.files);
    }
  }
  onAddFiles(files) {
    this.props.onChange(files);
  }
  validate(files) {
    const { accept } = this.props;
    if (files.length === 0) return false;
    const isFileTypeValid = !Array.from(files).some(file => !file.type.startsWith(accept));
    if (!isFileTypeValid) {
      notification.error({
        message: '不支持的文件类型',
      });
      return false;
    }
    return true;
  }
  render() {
    const { accept, multiple } = this.props;
    const { dragIsOver } = this.state;
    return (
      <div
        className={classnames(styles.UploadZone__wrapper, {
          [styles['UploadZone__wrapper--active']]: dragIsOver,
        })}
        onDragEnter={this.handleDragEnter}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
      >
        <input
          type="file"
          id="fileInput"
          accept={accept}
          multiple={multiple}
          onChange={this.handleChangeFiles}
          style={{
            display: 'none',
          }}
        />
        <label
          htmlFor="fileInput"
          className={styles.UploadZone__trigger}
        >
          <MdCloudUpload size={42} />
          <p>点击或拖拽上传 支持⌘(⌃) + V</p>
        </label>
      </div>
    );
  }
}
