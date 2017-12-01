/**
 * 环形计时器
 * @author ryan.bian
 */
import { PureComponent } from 'react';
import { Progress } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment-duration-format';

import styles from './index.less';
import { clearTimeout } from 'timers';

class CircleTimer extends PureComponent {
  static defaultProps = {
    id: undefined,
    duration: undefined,
    width: 200,
    status: 'active',
    onTimeUp() {},
  }
  static propTypes = {
    id: PropTypes.string,
    duration: PropTypes.number,
    width: PropTypes.number,
    status: PropTypes.oneOf(['success', 'exception', 'active']),
    onTimeUp: PropTypes.func,
  }
  constructor(props) {
    super(props);
    this.state = {
      percent: 100,
      content: '',
    };
    this.updateDuration(props);
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.duration && this.props.duration) {
      if (this.countTimer) {
        clearTimeout(this.countTimer);
        delete this.countTimer;
        delete this.durationMilliseconds;
        delete this.startTime;
      }
      this.setState({
        percent: 100,
        content: '',
      });
      return;
    }
    if (nextProps.id !== this.props.id) {
      return this.updateDuration(nextProps);
    }
  }
  updateDuration(props) {
    if (props.duration) {
      this.startTime = moment().valueOf();
      this.durationMilliseconds = props.duration * 60 * 1000;
      this.updateState();
    }
  }
  updateState() {
    const now = moment().valueOf();
    const diff = now - this.startTime;
    if (diff <= this.durationMilliseconds) {
      const duration = moment.duration(this.durationMilliseconds - diff);
      this.setState({
        percent: Math.round(100 * diff / this.durationMilliseconds),
        content: duration.format('mm:ss', { trim: false }),
      }, () => {
        this.countTimer = setTimeout(() => {
          this.updateState();
        }, 1000);
      });
    } else {
      this.setState({
        percent: 100,
        content: '00:00',
      }, () => {
        this.props.onTimeUp();
      });
    }
  }
  render() {
    const { percent, content } = this.state;
    const { width, status } = this.props;
    return (
      <div className={styles.CircleTimer}>
        <Progress
          type="circle"
          percent={percent}
          width={width}
          status={status}
          format={() => content}
        />
      </div>
    );
  }
}

export default CircleTimer;
