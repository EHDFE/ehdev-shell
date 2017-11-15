/**
 * AddDev Component
 * @author JeffWong
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import { Modal, Button, Form, Icon, Input, notification, message } from 'antd';

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
    this.props.installpck(this.props.rootPath, [{packageName: this.state.packageName, version: this.state.version}], this.props.tab === 'dependencies' ? ' --save' : ' --save-dev').then((data)=>{
      if ( data.success) {
        this.props.refresh().then(() => {
          notification['success']({
            message: 'SUCCESS',
            description: `${this.state.packageName} has been installed`,
          });
          this.setState({
            confirmLoading: false,
            packageName: '',
            version: ''
          });
          this.props.hideModal();
        });
      } else {
        this.setState({
          confirmLoading: false,
          packageName: '',
          version: ''
        });
        this.props.hideModal();
        notification['error']({
          message: 'ERROR MESSAGE',
          description: data.errorMsg,
          duration: null,
        });
      }

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