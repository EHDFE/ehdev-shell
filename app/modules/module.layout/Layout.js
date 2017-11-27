/**
 * Layout Module
 * @author ryan.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { withRouter } from 'react-router-dom';
import { Layout, Icon, Switch } from 'antd';
import moment from 'moment';
import isEqual from 'lodash/isEqual';

import { GLOBAL_NAV_CONFIG } from '../../CONFIG';

import { actions } from './store';

import SiderBar from '../../components/component.siderBar/';
import LayoutComponent from '../../components/component.layout/';

import styles from './index.less';

const dateFormat = 'YYYY-MM-DD';

class LayoutModule extends Component {
  static propTypes = {
    localImageUrl: PropTypes.string,
    title: PropTypes.string,
    paras: PropTypes.arrayOf(PropTypes.string),
    provider: PropTypes.string,
    attribute: PropTypes.string,
    getWallpaperInfo: PropTypes.func,
    children: PropTypes.any,
    location: PropTypes.object.isRequired,
  }
  state = {
    viewMode: false,
    date: moment().format(dateFormat),
    nav: this.getLayoutNav(this.props.location),
  }
  componentDidMount() {
    this.props.getWallpaperInfo(this.state.date);
  }
  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.location, this.props.location)) {
      this.setState({
        nav: this.getLayoutNav(nextProps.location),
      });
    }
  }
  getLayoutNav(location) {
    const { pathname } = location;
    const matched = GLOBAL_NAV_CONFIG.find(d => d.to === pathname);
    if (matched) {
      return matched;
    }
    return null;
  }
  toggleViewMode = () => {
    this.setState({
      viewMode: !this.state.viewMode,
    });
  }
  prev = () => {
    const { date } = this.state;
    const prevDate = moment(date).subtract(1, 'days').format(dateFormat);
    this.setState({
      date: prevDate,
    });
    this.props.getWallpaperInfo(prevDate);
  }
  next = e => {
    const { date } = this.state;
    if (e.target.dataset.disabled === 'true') {
      return;
    }
    const nextDate = moment(date).add(1, 'days').format(dateFormat);
    this.setState({
      date: nextDate,
    });
    this.props.getWallpaperInfo(nextDate);
  }
  renderWallpaperInfo() {
    const { title, paras, provider, attribute } = this.props;
    const { viewMode } = this.state;
    return (
      <div
        key="content"
        className={classnames(
          styles.Layout__Info,
          {
            [styles['Layout__Info--hide']]: !viewMode,
          },
        )}
      >
        <h2 className={styles.Layout__InfoTitle}>
          {title}{provider}
        </h2>
        <p>{paras.join('\n')}</p>
        <div>
          <Icon type="environment-o" />
          {attribute}
        </div>
      </div>
    );
  }
  render() {
    const today = moment().format(dateFormat);
    const { localImageUrl, children } = this.props;
    const { date, viewMode, nav } = this.state;
    const layoutProps = {
      padding: 0,
      backgroundUrl: localImageUrl,
      viewMode,
      tintColor: '#fff',
      tintOpacity: 0.7,
    };
    if (nav && nav.text) {
      Object.assign(layoutProps, {
        title: nav.text
      });
    }
    return (
      <Layout style={{ height: '100vh' }}>
        <SiderBar />
        {
          [
            <LayoutComponent key="layout" {...layoutProps}>
              {children}
            </LayoutComponent>,
            this.renderWallpaperInfo(),
            <div key="control" className={styles.Layout__Control}>
              <Switch
                className={styles.Layout__Switch}
                defaultChecked={false} onChange={this.toggleViewMode}
              />
              <Icon
                className={styles.Layout__Btn}
                type="left-circle-o"
                onClick={this.prev}
              />
              <Icon
                className={classnames(
                  styles.Layout__Btn,
                  {
                    [styles['Layout__Btn--disabled']]: today === date,
                  },
                )}
                type="right-circle-o"
                data-disabled={today === date}
                onClick={this.next}
              />
            </div>,
          ]
        }
      </Layout>
    );
  }
}

const wallpaperSelector = state => state['page.wallpaper'];

const mapStateToProps = state => createSelector(
  wallpaperSelector,
  (info) => {
    return {
      localImageUrl: info.url,
      title: info.title,
      paras: [info.para1, info.para2],
      provider: info.provider,
      attribute: info.attribute,
    };
  }
);

const mapDispatchToProps = dispatch => ({
  getWallpaperInfo: date => dispatch(actions.getWallpaperInfo(date)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LayoutModule));
