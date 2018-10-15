import { PureComponent, Fragment } from 'react';
import { Slider, Switch } from 'antd';
import PropTypes from 'prop-types';
import processorHoc from '../processorHoc';
import ProcessItem from '../ProcessItem';

export const defaultConfig = {
  interlaced: false,
  optimizationLevel: 1,
  colors: undefined,
  loop: false,
  lossy: 80,
};

@processorHoc()
class Gifsicle extends PureComponent {
  static processorName = 'gifsicle'
  static propTypes = {
    form: PropTypes.object,
    config: PropTypes.object,
  }
  static getDerivedStateFromProps(props, state) {
    return Object.assign(state, props.config);
  }
  state = defaultConfig
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <ProcessItem
          label={'循环播放'}
        >
          {getFieldDecorator('loop', {
            valuePropName: 'checked',
            initialValue: this.state.loop,
          })(
            <Switch size="small" />
          )}
        </ProcessItem>
        <ProcessItem
          label={'交错'}
          tooltip={'渐进渲染的 gif 图片'}
        >
          {getFieldDecorator('interlaced', {
            valuePropName: 'checked',
            initialValue: this.state.interlaced,
          })(
            <Switch size="small" />
          )}
        </ProcessItem>
        <ProcessItem
          label={'lossy'}
          extra={'压缩率'}
        >
          {getFieldDecorator('lossy', {
            initialValue: this.state.lossy,
          })(
            <Slider
              max={200}
              min={30}
              step={1}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'优化级别'}
          extra={'优化级别越高，效果越好但更耗时'}
        >
          {getFieldDecorator('optimizationLevel', {
            initialValue: this.state.optimizationLevel,
          })(
            <Slider
              max={3}
              min={1}
              step={1}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'颜色数'}
          extra={'减少输出 GIF 的颜色数量，2到256之间'}
        >
          {getFieldDecorator('colors', {
            initialValue: this.state.colors,
          })(
            <Slider
              max={256}
              min={2}
            />
          )}
        </ProcessItem>
      </Fragment>
    );
  }
}

export default Gifsicle;
