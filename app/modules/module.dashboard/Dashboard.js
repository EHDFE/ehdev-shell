/**
 * Dashboard Page
 * @author ryan.bian
 */
// import { Calendar } from 'antd';
import classnames from 'classnames';
import { List } from 'immutable';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { GREETING_WORDS } from '../../CONFIG';
import * as WeatherIcon from '../../components/component.weatherIcon';
import { actions as projectActions } from '../module.project/store';
import Card from './Card';
// import { Icon, Switch } from 'antd';
import styles from './index.less';
import { actions } from './store';
import AnalysisCard from './AnalysisCard';

class DashboardModule extends Component {
  static propTypes = {
    history: PropTypes.object,
    statistic: PropTypes.object,
    userName: PropTypes.string,
    base: PropTypes.object,
    // assetsCount: PropTypes.number,
    // projectsCount: PropTypes.number,
    // weather: PropTypes.object,
    // date: PropTypes.string,
    // weekday: PropTypes.number,
    getWeather: PropTypes.func,
    getDate: PropTypes.func,
    getProjectList: PropTypes.func,
    getOverall: PropTypes.func,
    setProjectRoot: PropTypes.func,
  };
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.base.get('date') !== nextProps.base.get('date')) {
      this.props.getWeather();
    }
  }
  componentDidMount() {
    this.props.getDate();
    this.props.getProjectList();
    this.props.getOverall();
  }
  navigateToProject = e => {
    e.preventDefault();
    const target = e.target;
    const rootPath = target.getAttribute('href');
    this.props.setProjectRoot(rootPath);
    const { history } = this.props;
    history.push('/project');
  };
  renderInfoBar() {
    const { userName, base } = this.props;
    let weatherBlock = [];
    const weather = base.get('weather');
    const weekday = base.get('weekday');
    if (weather) {
      if (Array.isArray(weather.weather)) {
        const Wcon = WeatherIcon[`Icon_${weather.weather[0].icon}`];
        weatherBlock.push(<Wcon key={'icon'} />);
      }
      if (weather.main) {
        weatherBlock.push(
          <p key={'tempture'} className={styles.Dashboard__WeatherTempture}>
            {weather.main.temp} °C
          </p>,
        );
      }
    }
    return (
      <Card className={styles.Dashboard__Info}>
        <div>
          {userName ? (
            <p className={styles.Dashboard__InfoName}>Hello {userName}</p>
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
    const { base, statistic } = this.props;
    const cards = [
      <Card
        className={classnames(
          styles.Dashboard__Summary,
          styles.Dashboard__SummaryProject,
        )}
        key={'projects'}
      >
        <h4 className={styles.Dashboard__SummaryTitle}>工程总数</h4>
        <em
          className={classnames(
            styles.Dashboard__SummaryCount,
            styles.Dashboard__SummaryProjectCount,
          )}
        >
          {base.get('projectsCount')}
        </em>
      </Card>,
      <Card
        className={classnames(
          styles.Dashboard__Summary,
          styles.Dashboard__SummaryAssets,
        )}
        key={'assets'}
      >
        <h4 className={styles.Dashboard__SummaryTitle}>资源总数</h4>
        <em
          className={classnames(
            styles.Dashboard__SummaryCount,
            styles.Dashboard__SummaryAssetsCount,
          )}
        >
          {base.get('assetsCount')}
        </em>
      </Card>,
      <Card
        className={classnames(
          styles.Dashboard__Summary,
          styles.Dashboard__SummaryBuild,
        )}
        key={'build'}
      >
        <h4 className={styles.Dashboard__SummaryTitle}>构建次数</h4>
        <em
          className={classnames(
            styles.Dashboard__SummaryCount,
            styles.Dashboard__SummaryBuildCount,
          )}
        >
          {statistic.reduce((p, d) => {
            return p + d.get('buildCount', 0);
          }, 0)}
        </em>
      </Card>,
    ];
    return cards;
  }
  // renderCalendar() {
  //   return (
  //     <Card className={styles.Dashboard__CalendarCard}>
  //       <Calendar fullscreen={false} />
  //     </Card>
  //   );
  // }
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
        <h3>构建分析</h3>
      </Card>
    );
  }
  renderAnalysisCard() {
    const { statistic } = this.props;
    return <AnalysisCard data={statistic} />;
  }
  render() {
    return (
      <div className={styles.Dashboard__Container}>
        {this.renderInfoBar()}
        {this.renderSummaryCards()}
        {this.renderAnalysisCard()}
      </div>
    );
    // {this.renderCalendar()}
    // {this.renderLastBuildStats()}
    // { this.renderBuildTimesRank() }
  }
}

const dashboardPageSelector = state => state['page.dashboard'];
const userPageSelector = state => state['page.user'];
const baseSelector = createSelector(dashboardPageSelector, state =>
  state.get('base'),
);
const projectsSelector = createSelector(dashboardPageSelector, state =>
  state.get('projects'),
);

const mapStateToProps = () =>
  createSelector(
    baseSelector,
    projectsSelector,
    userPageSelector,
    (base, projects, user) => ({
      base,
      statistic: projects.get('statistic', List([])),
      userName: user.get('name'),
    }),
  );
const mapDispatchToProps = dispatch => ({
  getWeather: () => dispatch(actions.base.getWeather()),
  getDate: () => dispatch(actions.base.getDate()),
  getProjectList: () => dispatch(actions.projects.getList()),
  getOverall: () => dispatch(actions.base.getOverall()),
  setProjectRoot: rootPath =>
    dispatch(projectActions.env.setRootPath(rootPath)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DashboardModule);
