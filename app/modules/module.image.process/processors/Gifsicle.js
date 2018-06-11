import { PureComponent, Fragment } from 'react';
import { Slider, Switch } from 'antd';
import PropTypes from 'prop-types';
import processorHoc from '../processorHoc';
import ProcessItem from '../ProcessItem';

@processorHoc()
export default class Gifsicle extends PureComponent {
  static processorName = 'gifsicle'
  static propTypes = {
    form: PropTypes.object,
  }
  state = {
    interlaced: false,
    optimizationLevel: 1,
    colors: undefined,
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <ProcessItem
          label={'交错'}
          tooltip={'渐进渲染的 gif 图片'}
        >
          {getFieldDecorator('interlaced', {
            valuePropName: 'checked',
            initialValue: this.state.interlaced,
          })(
            <Switch />
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
