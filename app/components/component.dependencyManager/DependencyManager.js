import { Button, Radio, Spin, Table, Tooltip, notification } from 'antd';
import { Map } from 'immutable';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import projectAPI from '../../apis/project';
import AddDev from '../component.addDev/';
import styles from './index.less';


const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class DependencyManager extends PureComponent {
  static propTypes = {
    pkgInfo: PropTypes.instanceOf(Map),
    pkg: PropTypes.instanceOf(Map),
    rootPath: PropTypes.string,
    refresh: PropTypes.func,
  };

  state = {
    dataSource: [],
    tab: 'dependencies',
    selectedRows: [],
    loading: false,
    modalVisible: false,
  };

  componentDidMount() {
    this.updateState(this.state.tab);
  }
  UNSAFE_componentWillReceiveProps() {
    this.updateState(this.state.tab);
  }

  filterData = e => {
    const value = e.target.value;
    this.updateState(value);
  };

  updateState(tab) {
    this.setState((prevState, props) => {
      const { pkg, pkgInfo } = props;
      const pkgObj = pkg.toJS();
      const data = [];
      for (let i in pkgObj && pkgObj[tab]) {
        const d = pkgInfo.getIn(['versions', i]);
        data.push(
          Object.assign({ key: i, packageName: i }, d, {
            dangerUpdate:
              d &&
              d.outdated &&
              d.current &&
              d.current.split('.')[0] !== d.latest.split('.')[0],
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
    }).catch(() => {
      this.setState({
        loading: false,
      });
    });
  }
  updatepkg = (record, index) => {
    this.setState(prevState => {
      let data = [...prevState.dataSource];
      data[index]['isUpdating'] = true;
      return {
        dataSource: data,
        loading: true,
      };
    });
    this.installPkg(
      record.packageName,
      this.props.rootPath,
      this.state.tab === 'dependencies' ? '--save' : '--save-dev'
    );
  };
  batchUpdate = () => {
    if (!this.state.selectedRows) {
      return;
    }
    this.setState({
      loading: true,
    });
    this.installPkg(
      this.state.selectedRows.map(d => [d.packageName, d.version].join('@')),
      this.props.rootPath,
      this.state.tab === 'dependencies' ? '-S' : '-D'
    );
  }

  handleUpdateDep = async () => {
    const { rootPath } = this.props;
    const result = await projectAPI.pkg.update(rootPath);
    if (result.success) {
      this.refresh()
        .then(() => {
          notification['success']({
            message: 'SUCCESS',
            description: '依赖更新成功!',
          });
        });
    } else {
      notification['error']({
        message: 'ERROR MESSAGE',
        description: '依赖更新失败',
        duration: null,
      });
    }
  }

  installPkg = async (packages, rootPath, type) => {
    const result = await projectAPI.pkg.install(packages, {
      rootPath,
      args: type,
    });
    if (result.success) {
      this.refresh().then(() => {
        notification['success']({
          message: 'SUCCESS',
          description: '依赖已更新!',
        });
      });
    } else {
      notification['error']({
        message: 'ERROR MESSAGE',
        description: '依赖更新失败',
        duration: null,
      });
    }
    return result;
  }
  uninstallPkg = async (record, index) => {
    const { rootPath, refresh } = this.props;
    this.setState(prevState => {
      let data = [...prevState.dataSource];
      data[index]['isDeleting'] = true;
      return {
        dataSource: data,
        loading: true,
      };
    });
    const result = await projectAPI.pkg.uninstall(
      record.packageName,
      {
        rootPath: rootPath,
        args: this.state.tab === 'dependencies' ? '--save' : '--save-dev',
      }
    );
    if (result.success) {
      refresh().then(() => {
        notification['success']({
          message: 'SUCCESS',
          description: `${record.packageName} 删除成功!`,
        });
      });
    } else {
      notification['error']({
        message: 'ERROR MESSAGE',
        description: `${record.packageName} 删除失败!`,
        duration: null,
      });
    }
  }

  showModal = () => {
    this.setState({
      modalVisible: true,
    });
  }

  hideModal = () => {
    this.setState({
      modalVisible: false,
    });
  }

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
                升级
              </Button>
              <Button
                type="danger"
                size="small"
                onClick={() => this.uninstallPkg(record, index)}
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
              onClick={this.batchUpdate}
              disabled={!this.props.pkg}
            >
              批量升级
            </Button>
            <div>
              <Button
                type="primary"
                size="small"
                onClick={this.showModal}
                disabled={!this.props.pkg}
              >
                添加依赖
              </Button>
              <Tooltip title="npm update">
                <Button
                  size="small"
                  onClick={this.handleUpdateDep}
                  disabled={!this.props.pkg}
                >
                  更新依赖
                </Button>
              </Tooltip>
            </div>
          </div>
          <AddDev
            visible={this.state.modalVisible}
            hideModal={this.hideModal}
            installPkg={this.installPkg}
            rootPath={this.props.rootPath}
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
