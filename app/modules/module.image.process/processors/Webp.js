import { PureComponent, Fragment } from 'react';
import { Slider, Switch, Select, InputNumber } from 'antd';
import PropTypes from 'prop-types';
import processorHoc, { markGenerator } from '../processorHoc';
import ProcessItem from '../ProcessItem';

const Option = Select.Option;

@processorHoc
export default class Webp extends PureComponent {
  static processorName = 'webp'
  static propTypes = {
    form: PropTypes.object,
  }
  state = {
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
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <ProcessItem
          label={'preset'}
          tooltip={'Preset setting.'}
        >
          {getFieldDecorator('preset', {
            initialValue: this.state.preset,
          })(
            <Select>
              <Option value={'default'}>default</Option>
              <Option value={'photo'}>photo</Option>
              <Option value={'picture'}>picture</Option>
              <Option value={'drawing'}>drawing</Option>
              <Option value={'icon'}>icon</Option>
              <Option value={'text'}>text</Option>
            </Select>
          )}
        </ProcessItem>
        <ProcessItem
          label={'quality'}
          tooltip={'Set quality factor between 0 and 100.'}
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
          label={'alphaQuality'}
          tooltip={'Set transparency-compression quality between 0 and 100.'}
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
          label={'method'}
          tooltip={'Specify the compression method to use, between 0 (fastest) and 6 (slowest).'}
          extra={'This parameter controls the trade off between encoding speed and the compressed file size and quality.'}
        >
          {getFieldDecorator('method', {
            initialValue: this.state.method,
          })(
            <Slider
              max={6}
              min={0}
              marks={markGenerator(
                { value: 0, label: 'fastest' },
                { value: 6, label: 'slowest' },
              )}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'size'}
          tooltip={'Set target size in bytes.'}
        >
          {getFieldDecorator('size', {
            initialValue: this.state.size,
          })(
            <InputNumber
              min={1}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'sns'}
          tooltip={'Set the amplitude of spatial noise shaping between 0 and 100.'}
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
          label={'filter'}
          tooltip={'Set deblocking filter strength between 0 (off) and 100.'}
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
          label={'autoFilter'}
          tooltip={'Adjust filter strength automatically.'}
        >
          {getFieldDecorator('autoFilter', {
            valuePropName: 'checked',
            initialValue: this.state.autoFilter,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'sharpness'}
          tooltip={'Set filter sharpness between 0 (sharpest) and 7 (least sharp).'}
        >
          {getFieldDecorator('sharpness', {
            initialValue: this.state.sharpness,
          })(
            <Slider
              max={7}
              min={0}
              marks={markGenerator(
                { value: 0, label: 'sharpest' },
                { value: 7, label: 'least shart' }
              )}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'lossless'}
          tooltip={'Encode images losslessly.'}
        >
          {getFieldDecorator('lossless', {
            valuePropName: 'checked',
            initialValue: this.state.lossless,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'nearLossless'}
          tooltip={'Encode losslessly with an additional lossy pre-processing step, with a quality factor between 0 and 100.'}
        >
          {getFieldDecorator('nearLossless', {
            initialValue: this.state.nearLossless,
          })(
            <Slider
              max={100}
              min={0}
              marks={markGenerator(
                { value: 0, label: 'maximum pre-processing' },
                { value: 100, label: 'lossless' }
              )}
            />
          )}
        </ProcessItem>
      </Fragment>
    );
  }
}
