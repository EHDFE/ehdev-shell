import { PureComponent, Fragment } from 'react';
import { Slider, Switch, Select, InputNumber } from 'antd';
import PropTypes from 'prop-types';
import processorHoc, { markGenerator } from '../processorHoc';
import ProcessItem from '../ProcessItem';

const Option = Select.Option;

export const defaultConfig = {
  preset: 'default',
  quality: 75,
  alphaQuality: 100,
  method: 4,
  size: undefined,
  sns: 80,
  filter: undefined,
  autoFilter: false,
  sharpness: 0,
  lossless: false,
  nearLossless: 100,
};

@processorHoc()
export default class Webp extends PureComponent {
  static processorName = 'webp'
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
          label={'预置'}
        >
          {getFieldDecorator('preset', {
            initialValue: this.state.preset,
          })(
            <Select>
              <Option value={'default'}>默认</Option>
              <Option value={'photo'}>照片</Option>
              <Option value={'picture'}>图片</Option>
              <Option value={'drawing'}>绘画</Option>
              <Option value={'icon'}>图标</Option>
              <Option value={'text'}>文本</Option>
            </Select>
          )}
        </ProcessItem>
        <ProcessItem
          label={'品质'}
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
          label={'alpha 品质'}
          tooltip={'设置透明压缩品质'}
        >
          {getFieldDecorator('alphaQuality', {
            initialValue: this.state.alphaQuality,
          })(
            <Slider
              max={100}
              min={0}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'压缩方式'}
          extra={'编码速度和压缩品质/文件体积权衡，0(速度最快) 到 6(最慢但是品质更好)'}
        >
          {getFieldDecorator('method', {
            initialValue: this.state.method,
          })(
            <Slider
              max={6}
              min={0}
              marks={markGenerator(
                { value: 0, label: '块' },
                { value: 6, label: '慢' },
              )}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'目标文件体积'}
        >
          {getFieldDecorator('size', {
            initialValue: this.state.size,
          })(
            <InputNumber
              min={1}
            />
          )} bytes
        </ProcessItem>
        <ProcessItem
          label={'sns'}
          tooltip={'时域噪声整型'}
        >
          {getFieldDecorator('sns', {
            initialValue: this.state.sns,
          })(
            <Slider
              max={100}
              min={0}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'滤波'}
          tooltip={'去块滤波强度'}
        >
          {getFieldDecorator('filter', {
            initialValue: this.state.filter,
          })(
            <Slider
              max={100}
              min={0}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'自动滤波'}
          tooltip={'自适应滤波强度'}
        >
          {getFieldDecorator('autoFilter', {
            valuePropName: 'checked',
            initialValue: this.state.autoFilter,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'锐度'}
        >
          {getFieldDecorator('sharpness', {
            initialValue: this.state.sharpness,
          })(
            <Slider
              max={7}
              min={0}
              marks={markGenerator(
                { value: 0, label: '高' },
                { value: 7, label: '低' }
              )}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'无损'}
          tooltip={'开启无损编码'}
        >
          {getFieldDecorator('lossless', {
            valuePropName: 'checked',
            initialValue: this.state.lossless,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'近无损压缩'}
          extra={'使用额外的有损预处理步骤进行无损编码，质量因子在0（最大预处理）和100（与无损相同）之间。'}
        >
          {getFieldDecorator('nearLossless', {
            initialValue: this.state.nearLossless,
          })(
            <Slider
              max={100}
              min={0}
              marks={markGenerator(
                { value: 0, label: '最大预处理' },
                { value: 100, label: '无损' }
              )}
            />
          )}
        </ProcessItem>
      </Fragment>
    );
  }
}
