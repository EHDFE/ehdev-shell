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
      if ( data.success ) {
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
    if ( this.state.confirmLoading ) {
      return;
    }
    this.setState({
      confirmLoading: false,
      packageName: '',
      version: ''
    });
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
        <Modal title="添加依赖"
          okText="安装"
          cancelText="取消"
          visible={this.props.visible}
          onOk={this.handleOk}
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
          closable={false}
        >
          <Input className={styles.input} value={this.state.packageName} onChange={this.handlePackageNameChange}  placeholder="依赖名称" />
          <Input className={styles.input} value={this.state.version} onChange={this.handleVerionChange}  placeholder="版本号（默认最新版本）" />
        </Modal>
      </div>
    );
  }
}

export default AddDev;
