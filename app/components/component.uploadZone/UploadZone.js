/**
 * Upload Zone Component
 */
import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import MdCloudUpload from 'react-icons/lib/md/cloud-upload';

import styles from './index.less';

export default class UploadZone extends Component {
  static defaultProps = {
    // 允许的上传类型
    accept: 'image/',
    onChange() {},
  }
  static propTypes = {
    accept: PropTypes.string,
    onChange: PropTypes.func,
  }
  state = {
    dragIsOver: false,
  }
  componentWillMount() {
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
    const { accept } = this.props;
    this.setState({
      dragIsOver: false,
    });
    if (files.length === 0 || !files[0].type.startsWith(accept)) return;
    this.onAddFiles(e.dataTransfer.files);
  }
  handleChangeFiles = ({ nativeEvent }) => {
    this.onAddFiles(nativeEvent.target.files);
  }
  handlePaste = ({ clipboardData }) => {
    if (clipboardData && clipboardData.files && clipboardData.files.length > 0) {
      const { accept } = this.props;
      if (!clipboardData.files[0].type.startsWith(accept)) return;
      this.onAddFiles(clipboardData.files);
    }
  }
  onAddFiles(files) {
    this.props.onChange(files);
  }
  render() {
    const { accept } = this.props;
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
          multiple
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
