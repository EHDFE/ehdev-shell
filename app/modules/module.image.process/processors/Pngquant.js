import { PureComponent, Fragment } from 'react';
import { Slider, Switch } from 'antd';
import PropTypes from 'prop-types';
import processorHoc, { markGenerator } from '../processorHoc';
import ProcessItem from '../ProcessItem';

export const defaultConfig = {
  floyd: 0.5,
  nofs: false,
  quality: 80,
  speed: 3,
};

@processorHoc('pngquant 通过把 png 转换成包含透明通道的8位图片来缩小文件体积（通常来说比24/32位图片要小60%～80%）')
export default class Pngquant extends PureComponent {
  static processorName = 'pngquant'
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
          label={'floyd'}
          tooltip={'控制抖动的级别'}
        >
          {getFieldDecorator('floyd', {
            initialValue: this.state.floyd,
          })(
            <Slider
              max={1}
              min={0}
              step={0.1}
              marks={markGenerator(
                { label: 'none', value: 0 },
                { label: 'full', value: 1 },
              )}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'nofs'}
          tooltip={'禁用 Floyd-Steinberg 抖动'}
        >
          {getFieldDecorator('nofs', {
            valuePropName: 'checked',
            initialValue: this.state.nofs,
          })(
            <Switch size="small" />
          )}
        </ProcessItem>
        <ProcessItem
          label={'品质'}
          extra={'0 到 100 之间，同 JPEG'}
        >
          {getFieldDecorator('quality', {
            initialValue: this.state.quality,
          })(
            <Slider
              max={100}
              min={0}
              marks={markGenerator(
                { label: 'worst', value: 0 },
                { label: 'perfect', value: 100 },
              )}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'速度'}
          extra={'速度/质量的权衡，1 (最佳质量) 到 10 (最快速度) 之间。速度 10 对比默认值 (速度 3)，以 5% 的效果损失换来 8 倍的速度提升。'}
        >
          {getFieldDecorator('speed', {
            initialValue: this.state.speed,
          })(
            <Slider
              max={11}
              min={1}
              marks={markGenerator(
                { label: 'slowest', value: 1 },
                { label: 'fastest', value: 11 },
              )}
            />
          )}
        </ProcessItem>
      </Fragment>
    );
  }
}
