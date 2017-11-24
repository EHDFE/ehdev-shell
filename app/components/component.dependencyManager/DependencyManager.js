import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Radio, Button, Spin, notification } from 'antd';
import AddDev from '../component.addDev/';

import styles from './index.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class DependencyManager extends Component {
  static propTypes = {
    pkgInfo: PropTypes.object,
    pkg: PropTypes.object,
    rootPath: PropTypes.string,
    getPkgInfo: PropTypes.func,
    getEnvData: PropTypes.func,
    refresh: PropTypes.func,
  };

  state = {
    dataSource: [],
    tab: 'dependencies',
    selectedRows: [],
    loading: false,
    modalVisible: false,
  };

  filterData = e => {
    const value = e.target.value;
    this.updateState(value);
  };
  updateState(tab) {
    this.setState((prevState, props) => {
      const { pkg, pkgInfo } = props;
      const data = [];
      for (let i in pkg && pkg[tab]) {
        const d = pkgInfo.versions[i];
        data.push(
          Object.assign({ key: i, packageName: i }, d, {
            dangerUpdate:
              d &&
              d.outdated &&
              d.current && d.current.split('.')[0] !== d.latest.split('.')[0],
          })
        );
      }
      return {
        dataSource: data,
        tab,
      };
    });
  }
  refresh = () => {
    this.setState({
      loading: true,
    });
    return this.props.refresh().then(() => {
      this.setState({
        loading: false,
      });
    });
  };
  updatepkg = (record, index) => {
    this.setState((prevState) => {
      let data = [...prevState.dataSource];
      data[index]['isUpdating'] = true;
      return {
        dataSource: data,
        loading: true,
      };
    });
    this.installpkg(
      this.props.rootPath,
      [{ packageName: record.packageName }],
      this.state.tab === 'dependencies' ? '--save' : '--save-dev'
    ).then(data => {
      if (data.success) {
        Promise.all([
          this.props.getPkgInfo(this.props.rootPath),
          this.props.getEnvData(this.props.rootPath),
        ]).then(() => {
          this.setState({
            loading: false,
          });
          notification['success']({
            message: 'SUCCESS',
            description: `${record.packageName} has been updated!`,
          });
        });
      } else {
        notification['error']({
          message: 'ERROR MESSAGE',
          description: data.errorMsg,
          duration: null,
        });
      }
    });
  };
  batchUpdate = () => {
    if (!this.state.selectedRows) {
      return;
    }
    this.setState({
      loading: true,
    });
    this.installpkg(
      this.props.rootPath,
      this.state.selectedRows,
      this.state.tab === 'dependencies' ? '--save' : '--save-dev'
    ).then(data => {
      if (data.success) {
        Promise.all([
          this.props.getPkgInfo(this.props.rootPath),
          this.props.getEnvData(this.props.rootPath),
        ]).then(() => {
          this.setState({
            loading: false,
            selectedRowKeys: [],
          });
          notification['success']({
            message: 'SUCCESS',
            description: 'All selected packages have been updated!',
          });
        });
      } else {
        notification['error']({
          message: 'ERROR MESSAGE',
          description: data.errorMsg,
          duration: null,
        });
      }
    });
  };

  installpkg = (rootPath, packages, type) => {
    return fetch('/api/npm/install', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rootPath,
        args: `${type}`,
        packages,
      }),
    }).then(res => res.json());
  };
  uninstallpkg = (record, index) => {
    this.setState((prevState) => {
      let data = [...prevState.dataSource];
      data[index]['isDeleting'] = true;
      return {
        dataSource: data,
        loading: true,
      };
    });
    fetch(`/api/npm/uninstall/${record.packageName}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rootPath: this.props.rootPath,
        args: this.state.tab === 'dependencies' ? '--save' : '--save-dev',
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          Promise.all([
            this.props.getPkgInfo(this.props.rootPath),
            this.props.getEnvData(this.props.rootPath),
          ]).then(() => {
            this.setState({
              loading: false,
            });
            notification['success']({
              message: 'SUCCESS',
              description: `${record.packageName} has been deleted!`,
            });
          });
        } else {
          notification['error']({
            message: 'ERROR MESSAGE',
            description: data.errorMsg,
            duration: null,
          });
        }
      });
  };

  componentDidMount() {
    this.updateState(this.state.tab);
  }
  componentWillReceiveProps() {
    this.updateState(this.state.tab);
  }

  showModal = () => {
    this.setState({
      modalVisible: true,
    });
  };
  hideModal = () => {
    this.setState({
      modalVisible: false,
    });
  };
  render() {
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRows });
      },
      getCheckboxProps: record => ({
        disabled: !record.outdated,
      }),
    };
    const columns = [
      {
        title: '依赖名称',
        dataIndex: 'packageName',
        render: (text, record) => {
          return record.outdated ? (
            <span style={{ color: 'red' }}>{text}</span>
          ) : (
            <span style={{ color: '#108ee9' }}>{text}</span>
          );
        },
      },
      {
        title: '当前版本',
        dataIndex: 'current',
      },
      {
        title: '预期版本',
        dataIndex: 'wanted',
      },
      {
        title: '最新版本',
        dataIndex: 'latest',
      },
      {
        title: '操作',
        render: (text, record, index) => {
          return (
            <div>
              <Button
                type={record.dangerUpdate ? 'danger' : 'primary'}
                disabled={!record.outdated}
                onClick={() => this.updatepkg(record, index)}
                style={{ marginRight: '20px' }}
                size="small"
              >
                更新
              </Button>
              <Button
                type="danger"
                size="small"
                onClick={() => this.uninstallpkg(record, index)}
              >
                删除
              </Button>
            </div>
          );
        },
      },
    ];
    return (
      <Spin spinning={this.state.loading}>
        <RadioGroup onChange={this.filterData} value={this.state.tab}>
          <RadioButton value="dependencies">Dependencies</RadioButton>
          <RadioButton value="devDependencies">Dev Dependencies</RadioButton>
        </RadioGroup>
        <div className={styles.Manager__Table}>
          <div className={styles.Manager__Action}>
            <Button
              size="small"
              onClick={ this.batchUpdate }
              disabled = {!this.props.pkg }
            >
              批量更新
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={this.showModal}
              disabled = {!this.props.pkg }
            >
              添加依赖
            </Button>
          </div>
          <AddDev
            visible={this.state.modalVisible}
            hideModal={this.hideModal}
            installpck={this.installpkg}
            refresh={this.refresh}
            rootPath={this.props.rootPath}
            tab={this.state.tab}
          />
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={this.state.dataSource}
            size="small"
          />
        </div>
      </Spin>
    );
  }
}

export default DependencyManager;
