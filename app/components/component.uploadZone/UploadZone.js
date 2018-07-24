/**
 * Upload Zone Component
 */
import { Component, Fragment } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import MdCloudUpload from 'react-icons/lib/md/cloud-upload';
import { notification } from 'antd';
import { remote } from 'electron';
import fm from '../../service/fileManager/';

import styles from './index.less';

const { dialog } = remote;

const ACCEPT_FILE_TYPES = new Map([
  ['image', ['png', 'gif', 'webp', 'jpg', 'jpeg', 'bmp', 'svg']],
  ['video', ['mkv', 'avi', 'flv', 'mp4', 'webm']],
  ['all', ['*']],
]);

export default class UploadZone extends Component {
  static defaultProps = {
    className: '',
    height: 140,
    // 允许的上传类型
    accept: 'image',
    onChange() {},
    multiple: true,
    content: undefined,
  }
  static propTypes = {
    className: PropTypes.string,
    height: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    accept: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.oneOf([...ACCEPT_FILE_TYPES.keys()]),
    ]),
    onChange: PropTypes.func,
    multiple: PropTypes.bool,
    content: PropTypes.element,
  }
  static getAcceptExts(accept) {
    if (ACCEPT_FILE_TYPES.has(accept)) {
      return ACCEPT_FILE_TYPES.get(accept);
    }
    return ACCEPT_FILE_TYPES.get('all');
  }
  state = {
    dragIsOver: false,
  }
  componentDidMount() {
    window.addEventListener('paste', this.handlePaste, false);
  }
  componentWillUnmount() {
    window.removeEventListener('paste', this.handlePaste, false);
  }
  handleClickUpload = () => {
    const { accept, multiple } = this.props;
    const properties = [
      'openFile',
    ];
    const acceptList = Array.isArray(accept) ? accept : [ accept ];
    const filters = acceptList.map(accept => ({
      name: accept,
      extensions: UploadZone.getAcceptExts(accept),
    }));
    if (multiple) {
      properties.push(
        'openDirectory',
        'multiSelections',
      );
    }
    dialog.showOpenDialog({
      filters,
      properties,
    }, filePaths => {
      if (filePaths) {
        fm.resolveFiles(filePaths)
          .then(files => {
            const validFiles = this.validate(files);
            if (validFiles.length > 0) {
              this.onAddFiles(validFiles);
            }
          });
      }
    });
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
    if (this.root.contains(e.relatedTarget)) return;
    this.setState({
      dragIsOver: false,
    });
  }
  handleDrop = async e => {
    e.preventDefault();
    const { files } = e.dataTransfer;
    this.setState({
      dragIsOver: false,
    });
    const directories = [];
    const fileList = [];
    for (const file of files) {
      if (fm.isDirectory(file.path)) {
        directories.push(file.path);
      } else {
        fileList.push(file);
      }
    }
    const fileFromDirectory = await fm.resolveFiles(directories);
    fileList.push(...fileFromDirectory);
    const validFiles = this.validate(fileList);
    if (validFiles.length > 0) {
      this.onAddFiles(validFiles);
    }
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
    if (accept === 'all') return files;
    const acceptList = Array.isArray(accept) ? accept : [ accept ];
    const extensions = acceptList.reduce((prev, accept) => {
      return prev.concat(UploadZone.getAcceptExts(accept));
    }, []);
    const validFiles = [];
    const invalidFiles = [];
    Array.from(files).forEach(file => {
      if (extensions.includes(file.name.split('.').pop().toLowerCase())) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    });
    if (invalidFiles.length > 0) {
      notification.warn({
        message: '不支持的文件类型',
        description: invalidFiles.map(file => <p key={file.path}>{file.name}</p>),
      });
    }
    return validFiles;
  }
  render() {
    const { className, height, content } = this.props;
    const { dragIsOver } = this.state;
    let buttonContent;
    if (content) {
      buttonContent = content;
    } else {
      buttonContent = (
        <Fragment>
          <MdCloudUpload size={42} />
          <p>点击或拖拽上传 支持⌘(⌃) + V</p>
        </Fragment>
      );
    }
    return (
      <div
        ref={node => this.root = node}
        className={classnames(className, styles.UploadZone__wrapper, {
          [styles['UploadZone__wrapper--active']]: dragIsOver,
        })}
        onDragEnter={this.handleDragEnter}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
      >
        <button
          className={styles.UploadZone__trigger}
          onClick={this.handleClickUpload}
          style={{
            height,
          }}
        >{buttonContent}</button>
      </div>
    );
  }
}
