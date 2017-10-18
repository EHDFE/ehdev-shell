/**
 * Folder Picker
 * @description pick folder
 * @author ryan.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, Icon } from 'antd';

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
  state = {
    value: this.props.value,
  }
  componentDidMount() {
    this.fileInput.setAttribute('webkitdirectory', true);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({
        value: nextProps.value,
      });
    }
  }
  handleClick = () => {
    this.fileInput.click();
  };
  handleChange = e => {
    if (e.target.files.length) {
      const value = e.target.files[0].path;
      this.setState({
        value,
      });
      this.props.onChange(value);
    }
  }
  render() {
    const { label } = this.props;
    const { value } = this.state;
    return (
      <div>
        <Input
          type="text"
          prefix={<Icon type="folder" />}
          value={value}
          onClick={this.handleClick}
        />
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
