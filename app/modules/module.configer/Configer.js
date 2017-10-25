/**
 * Configer Page Module
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import {
  Button,
  Table,
  Popconfirm,
  Badge,
} from 'antd';

import ConfigImportor from './ConfigImportor';

import { actions } from './store';

import styles from './index.less';

class ConfigerModule extends Component {
  static propTypes = {
    remoteConfigs: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired,
    })),
    localConfigs: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired,
    })),
    getConfigs: PropTypes.func,
    getRemoteConfigs: PropTypes.func,
    addConfig: PropTypes.func,
    uploadConfig: PropTypes.func,
    removeConfig: PropTypes.func,
  }
  state = {
    importVisible: false,
  }
  componentWillMount() {
    this.props.getConfigs();
    this.props.getRemoteConfigs();
  }
  handleDelete(name) {
    this.props.removeConfig(name);
  }
  handleAdd = values => {
    this.props.addConfig(values.configName);
    this.setState({
      importVisible: false,
    });
  }
  handleCloseImportor = () => {
    this.setState({
      importVisible: false,
    });
  }
  showConfigImporter = () => {
    this.setState({
      importVisible: true,
    });
  }
  render() {
    const { localConfigs, remoteConfigs } = this.props;
    const props = {
      pagination: false,
      columns: [
        {
          title: '引擎',
          dataIndex: 'name',
        },
        {
          title: '版本号',
          dataIndex: 'version',
          render: (text, record) => (
            <Badge dot>
              {text}
            </Badge>
          ),
        },
        {
          title: '操作',
          key: 'action',
          render: (text, record) => (
            <div className={styles.Configer__ItemAction}>
              <Button size="small">升级</Button>
              <Button size="small">详情</Button>
              <Popconfirm
                title="删除当前引擎，会导致使用该引擎的项目无法运行，确定要删除吗？"
                onConfirm={this.handleDelete.bind(this, record.name)}
              >
                <Button type="danger" size="small">删除</Button>
              </Popconfirm>
            </div>
          ),
        },
      ],
      dataSource: localConfigs.map(d => Object.assign(d, {
        key: d.name,
      })),
      locale: {
        emptyText: '当前没有可用的项目引擎',
      }
    };
    return (
      <div>
        <div className={styles.Configer__ActionBar}>
          <Button type="primary" onClick={this.showConfigImporter}>添加引擎</Button>
        </div>
        <Table {...props} />
        <ConfigImportor
          visible={this.state.importVisible}
          onCancel={this.handleCloseImportor}
          onConfirm={this.handleAdd}
        />
      </div>
    );
  }
}

const pageSelector = state => state['page.configer'];
const selectRemoteConfigs = createSelector(pageSelector, state => Object.values(state.remote.configMap));
const selectLocalConfigs = createSelector(pageSelector, state => Object.values(state.local.configMap));

const mapStateToProps = state => ({
  remoteConfigs: selectRemoteConfigs(state),
  localConfigs: selectLocalConfigs(state),
});
const mapDispatchToProps = dispatch => ({
  getConfigs: () => dispatch(actions.getConfigs()),
  getRemoteConfigs: () => dispatch(actions.getRemoteConfigs()),
  addConfig: () => dispatch(actions.add()),
  uploadConfig: () => dispatch(actions.upload()),
  removeConfig: name => dispatch(actions.remove(name)),
  upgradeConfig: name => dispatch(actions.upgrade(name)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConfigerModule);
