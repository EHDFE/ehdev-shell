import { PureComponent, Fragment } from 'react';
import { Slider, Switch, InputNumber } from 'antd';
import PropTypes from 'prop-types';
import processorHoc from '../processorHoc';
import ProcessItem from '../ProcessItem';

export const defaultConfig = {
  quality: 95,
  memlimit: 6000,
  nomemlimit: undefined,
};

@processorHoc('Guetzli 是一款高品质高压缩比的 JPEG 编码器，其生成的图片比接近质量的由 libjpeg 生成的图片体积小 20-30%')
export default class Guetzli extends PureComponent {
  static processorName = 'guetzli'
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
          label={'品质'}
          tooltip={'等效于 libjpeg 的品质'}
          extra={'不建议低于 84'}
        >
          {getFieldDecorator('quality', {
            initialValue: this.state.quality,
          })(
            <Slider
              max={100}
              min={0}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'内存使用限制'}
        >
          {getFieldDecorator('memlimit', {
            initialValue: this.state.memlimit,
          })(
            <InputNumber min={1} />
          )}
        </ProcessItem>
        <ProcessItem
          label={'不限制内存使用'}
        >
          {getFieldDecorator('nomemlimit', {
            valuePropName: 'checked',
            initialValue: this.state.nomemlimit,
          })(
            <Switch />
          )}
        </ProcessItem>
      </Fragment>
    );
  }
}
