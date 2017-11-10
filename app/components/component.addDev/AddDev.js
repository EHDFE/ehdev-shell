/**
 * AddDev Component
 * @author JeffWong
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import { Modal, Button, Form, Icon, Input,  Checkbox, message } from 'antd';

class AddDev extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    hideModal: PropTypes.func,
    installpck: PropTypes.func,
    tab: PropTypes.string,
    rootPath: PropTypes.string,
    getPkginfo: PropTypes.func,
    getEnvData: PropTypes.func,
    refresh: PropTypes.func,
  }
  state = {
    confirmLoading: false,
    packageName: '',
    version: ''
  }
  handleOk = () => {
    this.setState({
      confirmLoading: true,
    });  
    this.props.installpck(this.props.rootPath, [{packageName: this.state.packageName, version: this.state.version}], this.props.tab).then(()=>{
      this.setState({
        confirmLoading: false,
      });

      this.props.hideModal();
      this.props.refresh();
    });
  }
  handleCancel = () => {
    this.props.hideModal();
  }
  handlePackageNameChange = (event)=>{
    this.setState({packageName: event.target.value});
  }
  handleVerionChange = (event)=>{
    this.setState({version: event.target.value});
  }
  render() {
    const {  confirmLoading } = this.state;

    return (
      <div>
        <Modal title="Add New Dependency"
          okText="Install"
          cancelText="Cancel"
          visible={this.props.visible}
          onOk={this.handleOk}
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
        >
          <Input className={styles.input} value={this.state.packageName} onChange={this.handlePackageNameChange}  placeholder="Package Name" />
          <Input className={styles.input} value={this.state.version} onChange={this.handleVerionChange}  placeholder="Version" />
        </Modal>
      </div>
    );
  }
}

export default AddDev;