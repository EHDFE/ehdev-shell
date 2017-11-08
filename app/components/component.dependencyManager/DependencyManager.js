import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Table, Tabs, Button } from 'antd';

const TabPane = Tabs.TabPane;

class DependencyManager extends Component {
  static propTypes = {
    pkgInfo: PropTypes.object,
    pkg: PropTypes.object
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
      data.push(Object.assign({ key: i, packageName: i }, pkgInfo.versions[i]));
    }
    this.setState({
      dataSource: data,
      tab: key
    });
  };
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
        render: () => {
          return (
            <div>
              <Button type="primary" style={{ marginRight: '20px' }}>
                Update
              </Button>
              <Button type="danger">Delete</Button>
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
          <Button type="primary" style={{ float:'right' }}>
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
