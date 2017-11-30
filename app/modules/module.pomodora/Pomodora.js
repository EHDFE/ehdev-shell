/**
 * 番茄工作法
 * @author ryan.bian
 */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Slider } from 'antd';
import { MorphReplace } from 'react-svg-morph';
import PlayIcon from 'react-icons/lib/md/play-arrow';
import PauseIcon from 'react-icons/lib/md/pause';

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
    const { title, status } = current;
    let noticeTitle;
    if (status === 'focus') {
      noticeTitle = '休息一会';
    } else {
      noticeTitle = '休息结束';
    }
    new Notification(noticeTitle, {
      body: `${title} lalala`,
    });
  }
  renderJobConfig() {
    const { current } = this.props;
    const { title, focusPeriod, restPeriod } = this.state;
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
        <input
          type="text"
          placeholder="输入任务名称"
          className={styles.PomodoraModule__TitleInput}
          value={title}
          onChange={this.handleTitleChange}
        />
        <div>
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
        { this.renderJobConfig() }
        { this.renderTimer() }
        <Button
          type="primary"
          className={styles.PomodoraModule__ControlBtn}
          disabled={!current.id}
          onClick={this.handleClickControlBtn}
        >
          <MorphReplace width={32} height={32}>
            { !this.state.start ?
              <PlayIcon key={'play'} size={32} /> :
              <PauseIcon key={'stop'} size={32} />
            }
          </MorphReplace>
        </Button>
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
