import { PureComponent, Fragment } from 'react';
import { Slider, Switch, Select } from 'antd';
import PropTypes from 'prop-types';
import processorHoc, { markGenerator } from '../processorHoc';
import ProcessItem from '../ProcessItem';

const Option = Select.Option;

const dcScanExplain = new Map([
  [0, '0 个网格'],
  [1, '1 个网格'],
  [2, '2 个网格'],
]);

export const defaultConfig = {
  quality: 80,
  progressive: true,
  targa: false,
  revert: false,
  fastCrush: false,
  dcScanOpt: 1,
  trellis: true,
  trellisDC: true,
  tune: 'hvs-psnr',
  overshoot: true,
  arithmetic: false,
  dct: 'int',
  quantBaseline: false,
  quantTable: undefined,
  smooth: undefined,
};

@processorHoc()
export default class Mozjpeg extends PureComponent {
  static processorName = 'mozjpeg'
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
        >
          {getFieldDecorator('quality', {
            initialValue: this.state.quality,
          })(
            <Slider
              max={100}
              min={0}
              marks={markGenerator(
                { value: 0, label: '低' },
                { value: 100, label: '高' },
              )}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'渐进式'}
          extra={[
            <div key={'true'}>true: 渐进式图片(先显示一个轮廓，后渐渐清晰)</div>,
            <div key={'false'}>false 基线图片，逐行扫描（图片从上到下，逐行显示）</div>,
            <div key={'recomend'}>推荐开启</div>,
          ]}
        >
          {getFieldDecorator('progressive', {
            valuePropName: 'checked',
            initialValue: this.state.progressive,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'targa'}
          extra={'输入图片是 Targa 格式，一般不需要开启'}
        >
          {getFieldDecorator('targa', {
            valuePropName: 'checked',
            initialValue: this.state.targa,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'标准模式'}
          extra={[
            <div key="true">true: 使用标准模式</div>,
            <div key="false">false: 使用mozjpeg defaults模式</div>,
          ]}
        >
          {getFieldDecorator('revert', {
            valuePropName: 'checked',
            initialValue: this.state.revert,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'fastCrush'}
          tooltip={'禁用逐行扫描优化'}
          extra={[
            <div key={'true'}>true: 使用逐行扫描优化（progressive为false时有效）</div>,
            <div key={'false'}>false: 禁用逐行扫描优化（在渐进式图片有效）</div>,
          ]}
        >
          {getFieldDecorator('fastCrush', {
            valuePropName: 'checked',
            initialValue: this.state.fastCrush,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'DC 扫描'}
          tooltip={'设置 DC 扫描优化模式'}
          extra={'类似模糊效果，数字越大越模糊'}
        >
          {getFieldDecorator('dcScanOpt', {
            initialValue: this.state.dcScanOpt,
          })(
            <Slider
              max={2}
              min={0}
              tipFormatter={value => dcScanExplain.get(value)}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'网格'}
          tooltip={'网格优化'}
        >
          {getFieldDecorator('trellis', {
            valuePropName: 'checked',
            initialValue: this.state.trellis,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'DC 网格'}
          tooltip={'DC系数的网格优化'}
        >
          {getFieldDecorator('trellisDC', {
            valuePropName: 'checked',
            initialValue: this.state.trellisDC,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'tune'}
          tooltip={'设置网格优化方法'}
        >
          {getFieldDecorator('tune', { initialValue: this.state.tune })(
            <Select>
              <Option value="psnr">psnr</Option>
              <Option value="hvs-psnr">hvs-psnr</Option>
              <Option value="ssim">ssim</Option>
              <Option value="ms-ssim">ms-ssim</Option>
            </Select>
          )}
        </ProcessItem>
        <ProcessItem
          label={'overshoot'}
          tooltip={'Black-on-white deringing via overshoot.'}
        >
          {getFieldDecorator('overshoot', {
            valuePropName: 'checked',
            initialValue: this.state.overshoot,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'算术编码'}
          tooltip={'使用算术编码'}
        >
          {getFieldDecorator('arithmetic', {
            valuePropName: 'checked',
            initialValue: this.state.arithmetic,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'dct'}
          tooltip={'设置 DCT 方法.'}
        >
          {getFieldDecorator('dct', { initialValue: this.state.dct })(
            <Select>
              <Option value="int">integer DCT</Option>
              <Option value="fast">fast integer DCT (less accurate)</Option>
              <Option value="float">floating-point DCT</Option>
            </Select>
          )}
        </ProcessItem>
        <ProcessItem
          label={'quantBaseline'}
          tooltip={'使用8位量化表兼容 baseline JPEG'}
        >
          {getFieldDecorator('quantBaseline', {
            valuePropName: 'checked',
            initialValue: this.state.quantBaseline,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'量化表'}
          tooltip={'使用预定义的量化表'}
        >
          {getFieldDecorator('quantTable', { initialValue: this.state.quantTable })(
            <Select>
              <Option value={0}>JPEG Annex K</Option>
              <Option value={1}>Flat</Option>
              <Option value={2}>Custom, tuned for MS-SSIM</Option>
              <Option value={3}>ImageMagick table by N. Robidoux</Option>
              <Option value={4}>Custom, tuned for PSNR-HVS</Option>
              <Option value={5}>Table from paper by Klein, Silverstein and Carney</Option>
            </Select>
          )}
        </ProcessItem>
        <ProcessItem
          label={'平滑度'}
          tooltip={'设置平滑度'}
        >
          {getFieldDecorator('smooth', {
            initialValue: this.state.smooth,
          })(
            <Slider
              max={100}
              min={0}
            />
          )}
        </ProcessItem>
      </Fragment>
    );
  }
}
