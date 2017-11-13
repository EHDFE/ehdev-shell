import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import { Table, Tabs, Button, Spin, Form, message } from 'antd';
import AddDev from '../component.addDev/';

const TabPane = Tabs.TabPane;

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
    modalVisible: false
  };

  filterData = key => {
    this.setState((prevState, props) => {
      const { pkg, pkgInfo } = props;
      const data = [];
      for (let i in pkg[key]) {
        data.push(Object.assign({ key: i, packageName: i }, pkgInfo.versions[i], {
          dangerUpdate: pkgInfo.versions[i] && pkgInfo.versions[i].outdated && (pkgInfo.versions[i].current.split('.')[0] !== pkgInfo.versions[i].latest.split('.')[0])
        }));
      }
      return {
        dataSource: data,
        tab: key
      };
    });
  };
  refresh = () => {
    this.setState({
      loading: true
    });
    return this.props.refresh().then(() => {
      this.setState({
        loading: false 
      });
    });
  }
  updatepkg = (record, index) => {
    this.setState((prevState, props) => {
      let data =  [...prevState.dataSource];
      data[index]['isUpdating'] = true;
      return {
        dataSource: data,
        loading: true
      };
    });
    this.installpkg(this.props.rootPath, [{packageName: record.packageName}], this.state.tab === 'dependencies' ? '--save' : '--save-dev').then((data) => {
      if (data.success) {
        Promise.all([this.props.getPkgInfo(this.props.rootPath), this.props.getEnvData(this.props.rootPath)]).then(() => {
          this.setState({
            loading: false
          });
          message.success(`${record.packageName} has been updated!`);
        });
      }
    });
  }
  batchUpdate = () => {
    if (!this.state.selectedRows) {
      return;
    }
    this.setState({
      loading: true
    });
    this.installpkg(this.props.rootPath, this.state.selectedRows, this.state.tab === 'dependencies' ? '--save' : '--save-dev').then((data) => {
      if (data.success) {
        Promise.all([this.props.getPkgInfo(this.props.rootPath), this.props.getEnvData(this.props.rootPath)]).then(() => {
          this.setState({
            loading: false,
            selectedRowKeys: []
          });
          message.success('All selected packages have been updated!');
        });
      }
    });
  }

  installpkg =  (rootPath, packages, type) => {
    return fetch('/api/npm/install', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rootPath,
        args: `${type}`,
        packages
      })
    }).then((res) => res.json());
  }
  uninstallpkg =  (record, index) => {
    this.setState((prevState, props) => {
      let data =  [...prevState.dataSource];
      data[index]['isDeleting'] = true;
      return {
        dataSource: data,
        loading: true
      };
    });
    fetch(`/api/npm/uninstall/${record.packageName}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rootPath: this.props.rootPath,
        args: this.state.tab === 'dependencies' ? '--save' : '--save-dev'
      })
    }).then((res) => res.json()).then((data) => {
      if (data.success) {
        Promise.all([this.props.getPkgInfo(this.props.rootPath), this.props.getEnvData(this.props.rootPath)]).then(() => {
          this.setState({
            loading: false
          });
          message.success(`${record.packageName} has been deleted!`);
        });
      }
    });
  }

  componentDidMount() {
    this.filterData(this.state.tab);
  }
  componentWillReceiveProps() {
    this.filterData(this.state.tab);
  }

  showModal = () =>{
    this.setState({
      modalVisible: true
    });
  }
  hideModal = () =>{
    this.setState({
      modalVisible: false
    });
  }
  render() {
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({selectedRows});
      },
      getCheckboxProps: record => ({
        disabled: !record.outdated
      })
    };
    const columns = [
      {
        title: 'Package name',
        dataIndex: 'packageName',
        render: (text, record, index) => {
          return record.outdated ? (
            <span style={{ color: 'red' }}>{text}</span>
          ) : (
            <span style={{ color: '#108ee9' }}>{text}</span>
          );
        }
      },
      {
        title: 'Current',
        dataIndex: 'current'
      },
      {
        title: 'Wanted',
        dataIndex: 'wanted'
      },
      {
        title: 'Latest',
        dataIndex: 'latest'
      },
      {
        title: '操作',
        render: (text, record, index) => {
          return (
            <div>
              <Button type={record.dangerUpdate ? 'danger' : 'primary'}   disabled={!record.outdated}  onClick={()=> this.updatepkg(record, index)  }   style={{ marginRight: '20px' }}>
                Update
              </Button>
              <Button type="danger" onClick={()=> this.uninstallpkg(record, index)  } >
                Delete
              </Button>
            </div>
          );
        }
      }
    ];
    return (
      <Spin spinning={this.state.loading}>
        <Tabs onChange={this.filterData} type="card">
          <TabPane tab="Dependencies" key="dependencies" />
          <TabPane tab="Dev Dependencies" key="devDependencies" />
        </Tabs>
        <div style={{ marginBottom: '10px' }}>
          <Button type="primary" onClick={this.batchUpdate}>
            Batch Update
          </Button>
          <Button type="primary" onClick={this.showModal} style={{ float: 'right' }}>
            Add New Dependency
          </Button>
        </div>
        <AddDev visible={this.state.modalVisible}  hideModal={this.hideModal} installpck={this.installpkg} refresh={this.refresh} rootPath={this.props.rootPath} tab={this.state.tab}/>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={this.state.dataSource}
        />
      </Spin>
    );
  }
}

export default DependencyManager;
