import { PureComponent, Fragment } from 'react';
import { Switch } from 'antd';
import PropTypes from 'prop-types';
import processorHoc from '../processorHoc';
import ProcessItem from '../ProcessItem';

export const defaultConfig = {
  '8bit': false,
  transparent: false,
  // iterations: 15,
  // iterationsLarge: 5,
  more: false,
};

@processorHoc()
class Zopfli extends PureComponent {
  static processorName = 'zopfli';
  static propTypes = {
    form: PropTypes.object,
    config: PropTypes.object,
  };
  static getDerivedStateFromProps(props, state) {
    return Object.assign(state, props.config);
  }
  state = defaultConfig;
  render() {
    // <ProcessItem
    //   label={'迭代次数'}
    //   extra={'小于 200 kb 图像的迭代次数'}
    // >
    //   {getFieldDecorator('iterations', {
    //     initialValue: this.state.iterations,
    //   })(
    //     <InputNumber min={1} />
    //   )}
    // </ProcessItem>
    // <ProcessItem
    //   label={'大图迭代次数'}
    //   extra={'大于 200 kb 图像的迭代次数'}
    // >
    //   {getFieldDecorator('iterationsLarge', {
    //     initialValue: this.state.iterationsLarge,
    //   })(
    //     <InputNumber min={1} />
    //   )}
    // </ProcessItem>
    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <ProcessItem label={'8bit'} tooltip={'转换成每通道8位的图像'}>
          {getFieldDecorator('8bit', {
            valuePropName: 'checked',
            initialValue: this.state['8bit'],
          })(<Switch size="small" />)}
        </ProcessItem>
        <ProcessItem label={'透明'} extra={'允许修改完全透明像素的色值'}>
          {getFieldDecorator('transparent', {
            valuePropName: 'checked',
            initialValue: this.state.transparent,
          })(<Switch size="small" />)}
        </ProcessItem>
        <ProcessItem
          label={'压榨模式'}
          extra={'迭代更多次以便更高的压缩率（和文件尺寸相关）'}
        >
          {getFieldDecorator('more', {
            valuePropName: 'checked',
            initialValue: this.state.more,
          })(<Switch size="small" />)}
        </ProcessItem>
      </Fragment>
    );
  }
}

export default Zopfli;
