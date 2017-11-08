/**
 * Folder Picker
 * @description pick folder
 * @author ryan.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip, Icon } from 'antd';

import styles from './index.less';

export default class FolderPicker extends Component {
  static defaultProps = {
    label: '目录',
    value: '',
    onChange() {},
  }
  static propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
  }
  componentDidMount() {
    this.fileInput.setAttribute('webkitdirectory', true);
  }
  handleClick = () => {
    this.fileInput.click();
  };
  handleChange = e => {
    if (e.target.files.length) {
      const value = e.target.files[0].path;
      this.props.onChange(value);
    }
  }
  render() {
    return (
      <div>
        <Button
          icon="folder"
          onClick={this.handleClick}
          size={'small'}
        >
          选择目录
        </Button>
        <input
          ref={node => (this.fileInput = node)}
          type="file"
          style={{ display: 'none' }}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}
