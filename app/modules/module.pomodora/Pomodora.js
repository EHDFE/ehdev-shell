/**
 * 番茄工作法
 * @author ryan.bian
 */
import { PureComponent } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Button, Icon, Slider } from 'antd';
// import { MorphReplace } from 'react-svg-morph';
// import PlayIcon from 'react-icons/lib/md/play-arrow';
// import PauseIcon from 'react-icons/lib/md/pause';
import LoopIcon from 'react-icons/lib/md/loop';

import CircleTimer from '../../components/component.circleTimer/';

import { actions } from './store';

import styles from './index.less';
import { createSelector } from 'reselect';

class PomodoraModule extends PureComponent {
  static propTypes = {
    current: PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      status: PropTypes.oneOf(['focus', 'rest', 'finished']),
      times: PropTypes.arrayOf(
        PropTypes.shape({
          time: PropTypes.number,
          action: PropTypes.oneOf([
            'start',
            'rest',
            'focus',
            'stop',
          ]),
        })
      ),
    }),
    create: PropTypes.func,
    focus: PropTypes.func,
    rest: PropTypes.func,
    stop: PropTypes.func,
  }
  state = {
    title: '',
    focusPeriod: 25,
    restPeriod: 5,
    countdown: undefined,
    showSetting: false,
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.current.id && this.props.current.id) {
      this.setState({
        title: '',
        countdown: undefined,
      });
      return;
    }
    const nextStatus = nextProps.current.status;
    if (nextStatus !== this.props.current.status) {
      const { focusPeriod, restPeriod } = this.state;
      if (nextStatus === 'focus') {
        this.setState({
          countdown: focusPeriod,
        });
      } else if (nextStatus === 'rest') {
        this.setState({
          countdown: restPeriod,
        });
      }
    }
  }
  handleTitleChange = e => {
    this.setState({
      title: e.target.value
    });
  }
  handleCreateJob = () => {
    const { title, focusPeriod, restPeriod } = this.state;
    this.props.create(title, {
      focusPeriod,
      restPeriod,
    });
  }
  handleStopJob = () => {
    this.props.stop();
  }
  handleFocusPeriodChange = value => {
    this.setState({
      focusPeriod: value,
    });
  }
  handleRestPeriodChange = value => {
    this.setState({
      restPeriod: value,
    });
  }
  handleClickControlBtn = e => {
    const { current } = this.props;
    const { focusPeriod, restPeriod } = this.state;
    if (current.status === 'rest') {
      this.props.focus({
        focusPeriod,
        restPeriod,
      });
    } else if (current.status === 'focus') {
      this.props.rest({
        focusPeriod,
        restPeriod,
      });
    }
  }
  handleTimeUp = () => {
    const { current } = this.props;
    const { status } = current;
    const { focusPeriod, restPeriod } = this.state;
    let noticeTitle;
    let message;
    if (status === 'focus') {
      noticeTitle = '休息一会';
      message = `你已经连续专注 ${focusPeriod} 分钟了，休息以下更高效哦!`;
    } else {
      noticeTitle = '休息结束';
      message = `你已经休息了 ${restPeriod} 分钟，继续专注！`;
    }
    new Notification(noticeTitle, {
      body: message,
    });
  }
  handleSettingToggle = () => {
    this.setState({
      showSetting: !this.state.showSetting,
    });
  }
  renderJobConfig() {
    const { current } = this.props;
    const { title, focusPeriod, restPeriod, showSetting } = this.state;
    const sliderProps = {
      min: 1,
      max: 60,
    };
    let button;
    if (current.id) {
      button = (
        <Button
          type="danger"
          onClick={this.handleStopJob}
        >停止专注</Button>
      );
    } else {
      button = (
        <Button
          disabled={!title}
          onClick={this.handleCreateJob}
        >开始专注</Button>
      );
    }
    return (
      <div className={styles.PomodoraModule__Editor}>
        <div className={styles.PomodoraModule__Head}>
          <input
            type="text"
            placeholder="输入任务名称"
            className={styles.PomodoraModule__TitleInput}
            value={title}
            onChange={this.handleTitleChange}
          />
          <button
            className={styles.PomodoraModule__SettingTrigger}
            onClick={this.handleSettingToggle}
          >
            <Icon type="setting" />
          </button>
        </div>
        <div className={classnames(
          styles.PomodoraModule__Setting,
          {
            [styles['PomodoraModule__Setting--visible']]: showSetting,
          },
        )}>
          <h4>专注时长</h4>
          <Slider
            {...sliderProps}
            value={focusPeriod}
            onChange={this.handleFocusPeriodChange}
          />
          <h4>休息时长</h4>
          <Slider
            {...sliderProps}
            value={restPeriod}
            onChange={this.handleRestPeriodChange}
          />
        </div>
        { button }
      </div>
    );
  }
  renderTimer() {
    const { current } = this.props;
    const { countdown } = this.state;
    let status;
    if (current.status === 'focus') {
      status = 'active';
    } else if (current.status === 'rest') {
      status = 'exception';
    }
    return (
      <CircleTimer
        id={[current.id, current.status].join('')}
        duration={countdown}
        status={status}
        onTimeUp={this.handleTimeUp}
      />
    );
  }
  render() {
    const { current } = this.props;
    return (
      <div className={styles.PomodoraModule}>
        <Alert
          type="info"
          showIcon
          message="知识豆"
          description="番茄工作法（英语：Pomodoro Technique）是一种时间管理法方法，在上世纪八十年代由Francesco Cirillo创立。该方法使用一个定时器来分割出一个一般为25分钟的工作时间和5分钟的休息时间，而那些时间段被称为pomodori，为意大利语单词 pomodoro（中文：番茄）之复数。"
        />
        { this.renderJobConfig() }
        { this.renderTimer() }
        <div className={styles.PomodoraModule__Controls}>
          <Button
            type="danger"
            className={
              classnames(
                styles.PomodoraModule__ControlBtn,
                styles['PomodoraModule__ControlBtn--danger'],
              )
            }
            disabled={!current.id}
            onClick={this.handleClickControlBtn}
            ghost
          >
            <LoopIcon size={24} />
          </Button>
        </div>
      </div>
    );
  }
}

const pageSelector = state => state['page.pomodora'];
const mapStateToProps = createSelector(
  pageSelector,
  pageState => ({
    current: pageState.current
  }),
);

const mapDispatchToProps = dispatch => ({
  create: (title, periods) => dispatch(actions.createJob({ title }, periods, dispatch)),
  focus: periods => dispatch(actions.setFocus(periods, dispatch)),
  rest: periods => dispatch(actions.setRest(periods, dispatch)),
  stop: () => dispatch(actions.finishJob(dispatch)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PomodoraModule);
