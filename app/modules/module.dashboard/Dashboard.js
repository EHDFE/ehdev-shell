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
    weekday: PropTypes.number,
    getWeather: PropTypes.func,
    getDate: PropTypes.func,
    getProjectList: PropTypes.func,
    getOverall: PropTypes.func,
    getWallpaper: PropTypes.func,
  };
  componentDidMount() {
    this.props.getWeather();
    this.props.getDate();
    this.props.getProjectList();
    this.props.getOverall();
    this.props.getWallpaper();
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
          {
            projectsRank.map((o, i) => (
              <li
                data-index={i + 1}
                className={styles.Dashboard__ProjectRankItem}
                key={o._id}
                title={o.projectPath}
              >
                <p>{o.projectPath}</p>
              </li>
            ))
          }
        </ul>
      </Card>
    );
  }
  renderAlmanac() {
    return (
      <Card className={styles.Dashboard__AlmanacCard}>
        <Almanac />
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
  render() {
    let style =
      this.props.wallpaper && this.props.wallpaper.images[0].url
        ? {
          background: `url(http://www.bing.com${this.props.wallpaper.images[0]
            .url})`,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          height: '100vh',
          overflowY: 'auto',
        }
        : {};
    return (
      <div style={style}>
        <div className={styles.Dashboard__Container}>
          {this.renderInfoBar()}
          {this.renderSummaryCards()}
          {this.renderRecentsProjects()}
          {this.renderAlmanac()}
          {this.renderLastBuildStats()}
        </div>
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
  getWallpaper: () => dispatch(actions.base.getWallpaper()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardModule);
