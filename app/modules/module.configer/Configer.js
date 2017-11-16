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
  Tooltip,
} from 'antd';
import semver from 'semver';

import ConfigImportor from './ConfigImportor';
import Page from '../../components/component.page/';

import { actions } from './store';

import styles from './index.less';

class ConfigerModule extends Component {
  static propTypes = {
    pending: PropTypes.bool,
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
    upgradeConfig: PropTypes.func,
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
  handleAddConfig = values => {
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
  handleUpgrade = e => {
    const { name, version } = e.target;
    this.props.upgradeConfig(name, version);
  }
  showConfigImporter = () => {
    this.setState({
      importVisible: true,
    });
  }
  renderConfigList() {
    const { pending, localConfigs } = this.props;
    const props = {
      loading: pending,
      pagination: false,
      columns: [
        {
          title: '引擎',
          dataIndex: 'name',
        },
        {
          title: '描述',
          dataIndex: 'description',
        },
        {
          title: '版本号',
          dataIndex: 'version',
          render: (text, record) => {
            return record.upgradable ? (
              <Tooltip title={record.latestVersion}>
                <Badge dot>
                  {text}
                </Badge>
              </Tooltip>
            ) : text;
          },
        },
        {
          title: '操作',
          key: 'action',
          render: (text, record) => {
            const btns = [];
            if (record.upgradable) {
              btns.push(
                <Button
                  size="small"
                  key="upgrade"
                  data-version={record.latestVersion}
                  data-name={record.name}
                  onClick={this.handleUpgrade}
                >升级</Button>
              );
            }
            return (
              <div className={styles.Configer__ItemAction}>
                {btns}
                <Popconfirm
                  title="删除当前引擎，会导致使用该引擎的项目无法运行，确定要删除吗？"
                  onConfirm={this.handleDelete.bind(this, record.name)}
                >
                  <Button type="danger" size="small">删除</Button>
                </Popconfirm>
              </div>
            );
          }
        },
      ],
      dataSource: localConfigs.map(d => Object.assign(d, {
        key: d.name,
      })),
      locale: {
        emptyText: '当前没有可用的项目引擎',
      }
    };
    return <Table {...props} />;
  }
  render() {
    return (
      <Page>
        <div className={styles.Configer__ActionBar}>
          <Button type="primary" onClick={this.showConfigImporter}>添加引擎</Button>
        </div>
        { this.renderConfigList() }
        <ConfigImportor
          visible={this.state.importVisible}
          onCancel={this.handleCloseImportor}
          onConfirm={this.handleAddConfig}
        />
      </Page>
    );
  }
}

const pageSelector = state => state['page.configer'];
const selectRemoteConfigs = createSelector(pageSelector, state => Object.values(state.remote.configMap));
const selectLocalConfigs = createSelector(pageSelector, state => {
  const localConfigs = Object.values(state.local.configMap);
  const remoteConfigMap = state.remote.configMap;
  localConfigs.forEach(d => {
    const remoteConfig = remoteConfigMap[d.name];
    if (remoteConfig && semver.gt(remoteConfig.version, d.version)) {
      Object.assign(d, {
        upgradable: true,
        latestVersion: remoteConfig.version,
      });
    }
  });
  return localConfigs;
});

const mapStateToProps = state => ({
  remoteConfigs: selectRemoteConfigs(state),
  localConfigs: selectLocalConfigs(state),
  pending: createSelector(
    pageSelector,
    s => s.progress.pending,
  )(state),
});
const mapDispatchToProps = dispatch => ({
  getConfigs: () => dispatch(actions.getConfigs()),
  getRemoteConfigs: () => dispatch(actions.getRemoteConfigs()),
  addConfig: configName => dispatch(actions.add(configName, dispatch)),
  uploadConfig: () => dispatch(actions.upload()),
  removeConfig: name => dispatch(actions.remove(name, dispatch)),
  upgradeConfig: (name, version) => dispatch(actions.upgrade(name, version, dispatch)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConfigerModule);
