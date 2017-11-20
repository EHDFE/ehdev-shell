/**
 * Dashboard Page
 * @author ryan.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import classnames from 'classnames';

import Card from './Card';
import * as WeatherIcon from '../../components/component.weatherIcon';
import Almanac from '../../components/component.almanac';
import { actions } from './store';
import { GREETING_WORDS } from '../../CONFIG';

import { Icon, Switch } from 'antd';

import moment from 'moment';

import styles from './index.less';

class DashboardModule extends Component {
  static propTypes = {
    userName: PropTypes.string,
    assetsCount: PropTypes.number,
    projectsCount: PropTypes.number,
    weather: PropTypes.object,
    wallpaper: PropTypes.object,
    projectsRank: PropTypes.array,
    date: PropTypes.string,
    wallpaperDate: PropTypes.string,
    weekday: PropTypes.number,
    getWeather: PropTypes.func,
    getDate: PropTypes.func,
    getProjectList: PropTypes.func,
    getOverall: PropTypes.func,
    getWallpaper: PropTypes.func,
  };
  state = {
    showDashboard: true,
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.date !== this.props.date) {
      this.props.getWeather();
      this.props.getWallpaper();
    }
  }
  componentDidMount() {
    this.props.getDate();
    this.props.getProjectList();
    this.props.getOverall();
  }
  renderInfoBar() {
    const { userName, weekday, weather } = this.props;
    let weatherBlock = [];
    if (weather) {
      if (Array.isArray(weather.weather)) {
        const Wcon = WeatherIcon[`Icon_${weather.weather[0].icon}`];
        weatherBlock.push(<Wcon key={'icon'} />);
      }
      if (weather.main) {
        weatherBlock.push(
          <p key={'tempture'} className={styles.Dashboard__WeatherTempture}>
            {weather.main.temp} °C
          </p>
        );
      }
    }
    return (
      <Card className={styles.Dashboard__Info}>
        <div>
          {userName ? (
            <p className={styles.Dashboard__InfoName}>Hi {userName}</p>
          ) : null}
          <h2 className={styles['Dashboard__InfoGreeting']}>
            {GREETING_WORDS.get(weekday)}
          </h2>
        </div>
        <div className={styles.Dashboard__Weather}>{weatherBlock}</div>
      </Card>
    );
  }
  renderSummaryCards() {
    const { assetsCount, projectsCount } = this.props;
    const cards = [
      <Card
        className={classnames(
          styles.Dashboard__Summary,
          styles.Dashboard__SummaryProject
        )}
        key={'projects'}
      >
        <h4 className={styles.Dashboard__SummaryTitle}>工程总数</h4>
        <em
          className={classnames(
            styles.Dashboard__SummaryCount,
            styles.Dashboard__SummaryProjectCount
          )}
        >
          {projectsCount}
        </em>
      </Card>,
      <Card
        className={classnames(
          styles.Dashboard__Summary,
          styles.Dashboard__SummaryAssets
        )}
        key={'assets'}
      >
        <h4 className={styles.Dashboard__SummaryTitle}>资源总数</h4>
        <em
          className={classnames(
            styles.Dashboard__SummaryCount,
            styles.Dashboard__SummaryAssetsCount
          )}
        >
          {assetsCount}
        </em>
      </Card>,
    ];
    return cards;
  }
  renderRecentsProjects() {
    const { projectsRank } = this.props;
    return (
      <Card className={styles.Dashboard__ProjectsCard} title="常用工程">
        <ul className={styles.Dashboard__ProjectRankList}>
          {projectsRank.map((o, i) => (
            <li
              data-index={i + 1}
              className={styles.Dashboard__ProjectRankItem}
              key={o._id}
              title={o.projectPath}
            >
              <p>{o.projectPath}</p>
            </li>
          ))}
        </ul>
      </Card>
    );
  }
  renderAlmanac() {
    const { date } = this.props;
    return (
      <Card className={styles.Dashboard__AlmanacCard}>
        <Almanac date={date} />
      </Card>
    );
  }
  renderServerRunningDurationRank() {
    return (
      <Card>
        <h3>投入开发时间排行</h3>
      </Card>
    );
  }
  renderBuildTimesRank() {
    return (
      <Card className={styles.Dashboard__BuildTimes}>
        <h3>构建次数排行</h3>
      </Card>
    );
  }
  renderLastBuildStats() {
    return (
      <Card className={styles.Dashboard__BuildAnalyse}>
        <h3>上次构建分析</h3>
      </Card>
    );
  }
  showWallpaper = checked => {
    this.setState({
      showDashboard: !checked,
    });
  }
  changeWallpaper = tag => {
    if ( tag === 'before' ) {
      this.props.getWallpaper(this.props.wallpaperDate ? moment(this.props.wallpaperDate, 'YYYYMMDD').add(-1, 'day').format('YYYYMMDD') : moment().format('YYYYMMDD'));
    } else if ( tag === 'later' ) {
      this.props.getWallpaper(this.props.wallpaperDate ? moment(this.props.wallpaperDate, 'YYYYMMDD').add(1, 'day').format('YYYYMMDD') : moment().format('YYYYMMDD'));
    } else {
      this.props.getWallpaper(moment().format('YYYYMMDD'));
    }
  }
  render() {
    let style = this.props.wallpaper
      ? {
        backgroundImage: `url(http://127.0.0.1:3100${this.props.wallpaper.url})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed'
      }
      : {};
    return (
      <div style={style} className={styles.Dashboard__Wallpaper}>
        {this.state.showDashboard && (
          <div className={styles.Dashboard__Container}>
            {this.renderInfoBar()}
            {this.renderSummaryCards()}
            {this.renderRecentsProjects()}
            {this.renderAlmanac()}
            {this.renderLastBuildStats()}
          </div>
        )}
        <div className={styles.Wallpaper}>
          <Switch defaultChecked={false} onChange={this.showWallpaper} />
          {!this.state.showDashboard && (
            <div style={{ display: 'inline-block' }}>
              <Icon
                type="left-circle-o"
                style={{
                  marginLeft: '20px',
                  marginRight: '10px',
                  verticalAlign: 'middle',
                }}
                onClick={() => {
                  this.changeWallpaper('later');
                }}
              />
              <Icon type="right-circle-o" style={{ verticalAlign: 'middle', marginRight: '10px' }} onClick={() => { this.changeWallpaper('before'); } } />
              <Icon type="calendar" style={{ verticalAlign: 'middle', marginRight: '10px' }} onClick={() => { this.changeWallpaper('now'); } }/>
            </div>
          )}
        </div>
        {!this.state.showDashboard && (
          <div className={styles.Wallpaper__text}>
            {this.props.wallpaper.para1}
          </div>
        )}
      </div>
    );
    // { this.renderBuildTimesRank() }
  }
}

const dashboardPageSelector = state => state['page.dashboard'];
const userPageSelector = state => state['page.user'];
const baseSelector = createSelector(dashboardPageSelector, state => state.base);
const projectsSelector = createSelector(
  dashboardPageSelector,
  state => state.projects
);
const projectsRankSelector = createSelector(projectsSelector, state =>
  state.list.slice(0).sort((a, b) => b.count - a.count)
);
const userInfoSelector = createSelector(userPageSelector, state => state.user);

const mapStateToProps = state =>
  createSelector(
    baseSelector,
    projectsRankSelector,
    userInfoSelector,
    (base, projectsRank, userInfo) => ({
      ...base,
      projectsRank,
      userName: userInfo.name,
    })
  );
const mapDispatchToProps = dispatch => ({
  getWeather: () => dispatch(actions.base.getWeather()),
  getDate: () => dispatch(actions.base.getDate()),
  getProjectList: () => dispatch(actions.projects.getList()),
  getOverall: () => dispatch(actions.base.getOverall()),
  getWallpaper: day => dispatch(actions.base.getWallpaper(day)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardModule);
