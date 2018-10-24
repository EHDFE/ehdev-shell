/**
 * SplitPane Component
 * @author ryan bian
 */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Tabs, Icon } from 'antd';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { createSelector } from 'reselect';
import Resizable from 're-resizable';
import Terminal from '../../components/component.terminal';
import { actions } from '../module.project/store';

import styles from './index.less';

const { TabPane } = Tabs;
const TabBarHeight = 45;
const resizeDirectionConfig = {
  top: true,
  bottom: false,
  left: false,
  right: false,
  topRight: false,
  topLeft: false,
  bottomRight: false,
  bottomLeft: false,
};

class SplitPane extends PureComponent {
  static propTypes = {
    children: PropTypes.element,
    instances: PropTypes.instanceOf(Map),
    closeProject: PropTypes.func,
    serviceRootPath: PropTypes.string,
  };
  static defaultProps = {};
  static getDerivedStateFromProps(props, state) {
    if (props.serviceRootPath !== state.serviceRootPath) {
      return {
        serviceRootPath: props.serviceRootPath,
        currentKey: props.serviceRootPath,
      };
    } else {
      return {
        currentKey: state.currentKey,
      };
    }
  }
  state = {
    collapsed: false,
    height: 300,
    serviceRootPath: undefined,
    currentKey: 'terminal',
    resizing: false,
    resizeHandlerOffset: 0,
  };
  handleToggleConsoles = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };
  handleChangeTabs = targetKey => {
    this.setState({
      currentKey: targetKey,
    });
  };
  handleEditTabs = (targetKey, action) => {
    if (action === 'remove') {
      const { instances } = this.props;
      const targetInstance = instances.find(
        (d, rootPath) => rootPath === targetKey,
      );
      if (targetInstance) {
        this.props
          .closeProject(targetKey, targetInstance.get('ppid'))
          .then(() => {
            this.setState({
              currentKey: 'terminal',
            });
          });
      }
    }
  };
  handleResizeStart = () => {
    this.setState({
      resizing: true,
    });
  };
  handleResize = (event, direction, ref, delta) => {
    this.setState({
      resizeHandlerOffset: delta.height,
    });
  };
  handleResizeStop = (event, direction, ref, delta) => {
    const { height } = this.state;
    this.setState({
      height: height + delta.height,
      resizing: false,
      resizeHandlerOffset: 0,
    });
  };
  renderConsolePane() {
    const {
      collapsed,
      currentKey,
      height,
      resizing,
      resizeHandlerOffset,
    } = this.state;
    const style = {
      height: collapsed ? TabBarHeight : height,
    };
    const { instances } = this.props;
    const collapseCtrlHandler = (
      <button
        className={styles.SplitPane__CollapseCtrl}
        onClick={this.handleToggleConsoles}
      >
        <Icon type={collapsed ? 'up-circle' : 'down-circle'} theme="outlined" />
      </button>
    );
    const tabProps = {
      activeKey: currentKey,
      size: 'small',
      style,
      type: 'editable-card',
      className: classnames('ConsoleTabs', styles.SplitPane__ConsoleWrapper),
      hideAdd: true,
      tabBarExtraContent: collapseCtrlHandler,
      onChange: this.handleChangeTabs,
      onEdit: this.handleEditTabs,
    };
    const terminalHeight = height - TabBarHeight;
    return (
      <Resizable
        className={classnames(styles.SplitPane__Resize, {
          [styles['SplitPane__Resize--resizing']]: resizing,
        })}
        size={{
          height,
        }}
        enable={resizeDirectionConfig}
        handleStyles={{
          top: {
            top: -resizeHandlerOffset,
            height: 5,
          },
        }}
        handleClasses={{ top: styles.SplitPane__ResizeHandler }}
        onResizeStart={this.handleResizeStart}
        onResize={this.handleResize}
        onResizeStop={this.handleResizeStop}
      >
        <Tabs {...tabProps}>
          <TabPane closable={false} key="terminal" tab="终端">
            <Terminal
              className={classnames(styles.SplitPane__Terminal, {
                [styles['SplitPane__Terminal--hidden']]: collapsed,
              })}
              height={terminalHeight}
            />
          </TabPane>
          {instances
            .map((d, rootPath) => (
              <TabPane key={rootPath} tab={d.get('projectName')}>
                <Terminal
                  className={classnames(styles.SplitPane__Terminal, {
                    [styles['SplitPane__Terminal--hidden']]: collapsed,
                  })}
                  height={terminalHeight}
                  pid={d.get('ppid')}
                  disableStdin
                />
              </TabPane>
            ))
            .valueSeq()
            .toArray()}
        </Tabs>
      </Resizable>
    );
  }
  render() {
    const { children } = this.props;
    const { height, collapsed } = this.state;
    const style = {
      height: collapsed
        ? `calc(100% - ${TabBarHeight}px)`
        : `calc(100% - ${height}px)`,
    };
    return (
      <div className={styles.SplitPane}>
        <div style={style} className={styles.SplitPane__Content}>
          {children}
        </div>
        {this.renderConsolePane()}
      </div>
    );
  }
}

const serviceSelector = state => state['page.project.service'];
const mapStateToProps = () =>
  createSelector(serviceSelector, serviceState => ({
    instances: serviceState.get('instances'),
    serviceRootPath: serviceState.get('serviceRootPath'),
  }));
const mapDispatchToProps = dispatch => ({
  closeProject: (rootPath, ppid) =>
    dispatch(actions.service.closeProject(rootPath, ppid)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SplitPane);
