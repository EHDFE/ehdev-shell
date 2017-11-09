/**
 * Dashboard Page
 * @author ryan.bian
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import moment from 'moment';

import Card from './Card';
import { actions } from './store';
import { GREETING_WORDS } from '../../CONFIG';

import styles from './index.less';

class DashboardModule extends Component {
  renderSummaryBar() {
    const today = moment();
    const weekDay = today.day();
    const date = today.format('YYYY-DD-MM');
    return (
      <Card>
        <h2 className={styles['Dashboard__Summary--greeting']}>{GREETING_WORDS.get(weekDay)}</h2>
        <h3>{date}</h3>
      </Card>
    );
  }
  renderRecentsProjects() {
    return (
      <Card>
        <h3>最近项目</h3>
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

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({

});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DashboardModule);
