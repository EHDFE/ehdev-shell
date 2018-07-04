/**
 * SiderBar Component
 * @author ryan.bian
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Layout, Menu, Icon, Avatar } from 'antd';
import { Set } from 'immutable';

import styles from './index.less';

import { GLOBAL_NAV_CONFIG } from '../../CONFIG';

const { Sider } = Layout;
const { Item } = Menu;

class SiderBar extends Component {
  static __ANT_LAYOUT_SIDER = true
  static propTypes = {
    current: PropTypes.string,
    navigate: PropTypes.func,
    user: PropTypes.object,
    showInfo: PropTypes.func,
    enabledModules: PropTypes.instanceOf(Set),
  }
  state = {
    collapsed: true,
  }
  onCollapse = (collapsed) => {
    this.setState({
      collapsed,
    });
  }
  onSelectMenu = ({ key }) => {
    this.props.navigate(`/${key}`);
  }
  backToHome = () => {
    this.props.navigate('/');
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
    const { collapsed } = this.state;
    const { user, current, enabledModules } = this.props;
    const ENABLED_NAVS = GLOBAL_NAV_CONFIG.filter(d => enabledModules.has(d.to) || !d.configurable);
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
          <Avatar src={user.get('avatar')} icon="user" size={collapsed ? 'default' : 'large'} />
        </button>
        <div className={styles.SiderBar__Content}>
          <Menu
            mode="inline"
            selectedKeys={[current]}
            onSelect={this.onSelectMenu}
            theme={'dark'}
            className={styles.SiderBar__Menu}
          >
            {
              ENABLED_NAVS.map(d => (
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
  enabledModules: state['page.setting'].get('enabledModules', Set()),
});

export default connect(
  mapStateToProps,
  null,
)(SiderBar);
