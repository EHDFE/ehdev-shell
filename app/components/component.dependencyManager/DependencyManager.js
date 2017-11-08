import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Table } from 'antd';

const columns = [
  {
    title: 'package name',
    dataIndex: 'packageName'
  },
  {
    title: 'current',
    dataIndex: 'current'
  },
  {
    title: 'wanted',
    dataIndex: 'wanted'
  },
  {
    title: 'latest',
    dataIndex: 'latest'
  }
];

class DependencyManager extends Component {
  static propTypes = {
    pkgInfo: PropTypes.object
  }
  
  render() {
    const { pkgInfo } = this.props;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {},
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User' // Column configuration not to be checked
      })
    };
    const data = [];
    for (let i in pkgInfo.versions) {
      data.push(Object.assign({ key: i, packageName: i }, pkgInfo.versions[i]));
    }

    return (
      <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
    );
    // return (
    //   <div>ddd</div>
    // );
  }
}


export default DependencyManager;
