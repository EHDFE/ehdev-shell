import { PureComponent, Fragment } from 'react';
import { Slider, Switch, Select } from 'antd';
import PropTypes from 'prop-types';
import processorHoc, { markGenerator } from '../processorHoc';
import ProcessItem from '../ProcessItem';

const Option = Select.Option;

@processorHoc
export default class Mozjpeg extends PureComponent {
  static processorName = 'mozjpeg'
  static propTypes = {
    form: PropTypes.object,
  }
  state = {
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
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <ProcessItem
          label={'quality'}
          tooltip={'Compression quality, in range 0 (worst) to 100 (perfect).'}
        >
          {getFieldDecorator('quality', {
            initialValue: this.state.quality,
          })(
            <Slider
              max={100}
              min={0}
              marks={markGenerator(
                { value: 0, label: 'worst' },
                { value: 100, label: 'perfect' },
              )}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'progressive'}
          tooltip={'`false` creates baseline JPEG file'}
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
          tooltip={'Input file is Targa format (usually not needed).'}
        >
          {getFieldDecorator('targa', {
            valuePropName: 'checked',
            initialValue: this.state.targa,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'revert'}
          tooltip={'Revert to standard defaults instead of mozjpeg defaults.'}
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
          tooltip={'Disable progressive scan optimization.'}
        >
          {getFieldDecorator('fastCrush', {
            valuePropName: 'checked',
            initialValue: this.state.fastCrush,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'dcScanOpt'}
          tooltip={'Set DC scan optimization mode.'}
        >
          {getFieldDecorator('dcScanOpt', {
            initialValue: this.state.dcScanOpt,
          })(
            <Slider
              max={2}
              min={0}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'trellis'}
          tooltip={'Trellis optimization.'}
        >
          {getFieldDecorator('trellis', {
            valuePropName: 'checked',
            initialValue: this.state.trellis,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'trellisDC'}
          tooltip={'Trellis optimization of DC coefficients.'}
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
          tooltip={'Set Trellis optimization method.'}
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
          label={'arithmetic'}
          tooltip={'Use arithmetic coding.'}
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
          tooltip={'Set DCT method.'}
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
          tooltip={'Use 8-bit quantization table entries for baseline JPEG compatibility.'}
        >
          {getFieldDecorator('quantBaseline', {
            valuePropName: 'checked',
            initialValue: this.state.quantBaseline,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'quantTable'}
          tooltip={'Use predefined quantization table.'}
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
          label={'smooth'}
          tooltip={'Set the strength of smooth dithered input.'}
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
