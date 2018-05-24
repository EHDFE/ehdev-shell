/**
 * SiderBar Component
 * @author ryan.bian
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
// import classNames from 'classnames';

import { Layout, Menu, Icon, Avatar } from 'antd/es/';

import styles from './index.less';

import { GLOBAL_NAV_CONFIG } from '../../CONFIG';

const { Sider } = Layout;
const { Item } = Menu;

@withRouter
class SiderBar extends Component {
  static __ANT_LAYOUT_SIDER = true
  static propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    user: PropTypes.object,
  }

  state = {
    collapsed: true,
    selectedKey: this.getSelectedKey(this.props),
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.location, this.props.location)) {
      this.setState({
        selectedKey: this.getSelectedKey(nextProps),
      });
    }
  }
  getSelectedKey(props) {
    const { location } = props;
    const { pathname } = location;
    const matched = GLOBAL_NAV_CONFIG.find(d => d.to === pathname);
    if (matched) {
      return matched.to;
    }
    return null;
  }
  onCollapse = (collapsed) => {
    this.setState({
      collapsed,
    });
  }
  onSelectMenu = ({ item, key }) => {
    this.props.history.replace(key);
    this.setState({
      selectedKey: key,
    });
  }
  backToHome = () => {
    this.props.history.replace('/');
    this.setState({
      selectedKey: null,
    });
  }
  renderTrigger() {
    const { collapsed } = this.state;
    let iconType;
    if (collapsed) {
      iconType = 'right-circle-o';
    } else {
      iconType = 'left-circle-o';
    }
    return (
      <div className={styles.SiderBar__Trigger}>
        <Icon
          type={iconType}
          style={{
            fontSize: 18,
          }}
        />
      </div>
    );
  }
  render() {
    const { collapsed, selectedKey } = this.state;
    const { user } = this.props;
    return (
      <Sider
        className={styles.SiderBar}
        collapsible
        collapsed={collapsed}
        onCollapse={this.onCollapse}
        width={130}
        trigger={this.renderTrigger()}
      >
        <button
          type="button"
          className={styles.SiderBar__avatar}
          onClick={this.backToHome}
        >
          <Avatar src={user.get('avatar')} icon="user" size={(collapsed && this.state.selectedKey) ? 'default' : 'large'} />
        </button>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onSelect={this.onSelectMenu}
          theme={'dark'}
          className={styles.SiderBar__Menu}
        >
          {
            GLOBAL_NAV_CONFIG.map(d => (
              <Item key={d.to}>
                <Icon type={d.icon} />
                <span>{d.text}</span>
              </Item>
            ))
          }
        </Menu>
      </Sider>
    );
  }
}

const mapStateToProps = state => ({
  user: state['page.user'],
});

export default connect(
  mapStateToProps,
  null,
)(SiderBar);
