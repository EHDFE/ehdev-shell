/**
 * Dashboard Page
 * @author ryan.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Card from './Card';
import * as WeatherIcon from '../../components/component.weatherIcon';
import { actions } from './store';
import { GREETING_WORDS } from '../../CONFIG';

import styles from './index.less';

class DashboardModule extends Component {
  static propTypes = {
    weather: PropTypes.object,
    projectsRank: PropTypes.array,
    date: PropTypes.string,
    weekday: PropTypes.number,
    getWeather: PropTypes.func,
    getDate: PropTypes.func,
    getProjectList: PropTypes.func,
  }
  componentDidMount() {
    this.props.getWeather();
    this.props.getDate();
    this.props.getProjectList();
  }
  renderSummaryBar() {
    const { weekday, date, weather } = this.props;
    let weatherBlock = [];
    if (weather) {
      if (Array.isArray(weather.weather)) {
        const Wcon = WeatherIcon[`Icon_${weather.weather[0].icon}`];
        weatherBlock.push(<Wcon />);
      }
      if (weather.main) {
        weatherBlock.push(
          <p className={styles.Dashboard__WeatherTempture}>
            {weather.main.temp} °C
          </p>
        );
      }
    }
    return (
      <Card className={styles.Dashboard__Summary}>
        <div className={styles.Dashboard__SummaryDate}>
          <h2 className={styles['Dashboard__SummaryGreeting']}>{GREETING_WORDS.get(weekday)}</h2>
          <h3>{date}</h3>
        </div>
        <div className={styles.Dashboard__Weather}>
          { weatherBlock }
        </div>
      </Card>
    );
  }
  renderRecentsProjects() {
    const { projectsRank } = this.props;
    return (
      <Card>
        <h3>最近项目</h3>
        {
          projectsRank.map(o => (
            <div key={o._id}>{o.projectPath}</div>
          ))
        }
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
      <Card>
        <h3>构建次数排行</h3>
      </Card>
    );
  }
  renderLastBuildStats() {
    return (
      <Card>
        <h3>上次构建分析</h3>
      </Card>
    );
  }
  render() {
    return (
      <div className={styles.Dashboard__Container}>
        { this.renderSummaryBar() }
        { this.renderRecentsProjects() }
        { this.renderServerRunningDurationRank() }
        { this.renderBuildTimesRank() }
        { this.renderLastBuildStats() }
      </div>
    );
  }
}

const dashboardPageSelector = state => state['page.dashboard'];
const baseSelector = createSelector(
  dashboardPageSelector,
  state => state.base,
);
const projectsSelector = createSelector(
  dashboardPageSelector,
  state => state.projects,
);
const projectsRankSelector = createSelector(
  projectsSelector,
  state => state.list.slice(0).sort((a, b) => b.count - a.count),
);

const mapStateToProps = state => createSelector(
  baseSelector,
  projectsRankSelector,
  (base, projectsRank) => ({
    ...base,
    projectsRank,
  }),
);
const mapDispatchToProps = dispatch => ({
  getWeather: () => dispatch(actions.base.getWeather()),
  getDate: () => dispatch(actions.base.getDate()),
  getProjectList: () => dispatch(actions.projects.getList()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DashboardModule);
