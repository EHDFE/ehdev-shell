/**
 * SiderBar Component
 * @author ryan.bian
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Layout, Menu, Icon, Avatar } from 'antd';

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
    showInfo: PropTypes.func,
  }
  static getSelectedKey(props) {
    const { location } = props;
    const { pathname } = location;
    const matched = GLOBAL_NAV_CONFIG.find(d => d.to === pathname);
    if (matched) {
      return matched.to;
    }
    return null;
  }
  static getDerivedStateFromProps(props, state) {
    return {
      selectedKey: SiderBar.getSelectedKey(props)
    };
  }
  state = {
    collapsed: true,
    selectedKey: SiderBar.getSelectedKey(this.props),
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
  handleInfoClick = () => {
    this.props.showInfo();
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
        <div className={styles.SiderBar__Content}>
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
          <button
            className={styles.SiderBar__InfoButton}
            onClick={this.handleInfoClick}
          >
            <Icon type="info-circle-o" />
          </button>
        </div>
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
