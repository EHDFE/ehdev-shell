import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import { Table, Tabs, Button, message } from 'antd';

const TabPane = Tabs.TabPane;

class DependencyManager extends Component {
  static propTypes = {
    pkgInfo: PropTypes.object,
    pkg: PropTypes.object,
    rootPath: PropTypes.string,
    getPkginfo: PropTypes.func,
    getEnvData: PropTypes.func,
  };

  state = {
    dataSource: [],
    tab: 'dependencies',
    selectedRows: []
  };

  filterData = key => {
    const { pkg, pkgInfo } = this.props;
    const data = [];
    for (let i in pkg[key]) {
      data.push(Object.assign({ key: i, packageName: i, isUpdating: false, isDeleting: false }, pkgInfo.versions[i]));
    }
    this.setState({
      dataSource: data,
      tab: key
    });
  };
  
  updatepkg = (record, index) => {   
    this.setState((prevState, props) => {
      let data =  [...prevState.dataSource];
      data[index]['isUpdating'] = true;
      return {
        dataSource: data
      };
    }); 
    this.installpkg(this.props.rootPath, [record.packageName], '--save').then((data) => {
      if (data.success) {
        message.success(`${record.packageName} has been updated!`);
        this.props.getPkginfo(this.props.rootPath);
        this.props.getEnvData(this.props.rootPath);
      }
    });
  }

  installpkg =  (rootPath, packages, type) => {
    let packageName;
    if (packages&&packages.length === 1) {
      packageName = packages;
    }
    return fetch(`/api/npm/install/${packageName?packageName+'/':''}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rootPath,
        args: `${packages.join(' ')} ${type}`   
      })
    }).then((res) => res.json());
  }

  componentDidMount() {
    this.filterData(this.state.tab);
  }
  componentWillReceiveProps() {
    this.filterData(this.state.tab);
  }

  render() {
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({selectedRows});
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User' // Column configuration not to be checked
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
              <Button type="primary" onClick={()=> this.updatepkg(record, index)  } loading={record.isUpdating}  style={{ marginRight: '20px' }}>
                Update
              </Button>
              <Button type="danger" loading={record.isDeleting}>
                Delete
              </Button>
            </div>
          );
        }
      }
    ];
    return (
      <div>
        <Tabs onChange={this.filterData} type="card">
          <TabPane tab="Dependencies" key="dependencies" />
          <TabPane tab="Dev Dependencies" key="devDependencies" />
        </Tabs>
        <div style={{ marginBottom: '10px' }}>
          <Button type="primary">
            Batch Update
          </Button>
          <Button type="primary" style={{ float: 'right' }}>
            Add New Dependency
          </Button>
        </div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={this.state.dataSource}
        />
      </div>
    );
  }
}

export default DependencyManager;
