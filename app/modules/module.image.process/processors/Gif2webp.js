import { PureComponent, Fragment } from 'react';
import { Slider, Switch, Select, InputNumber } from 'antd';
import PropTypes from 'prop-types';
import processorHoc, { markGenerator } from '../processorHoc';
import ProcessItem from '../ProcessItem';

const Option = Select.Option;

export const defaultConfig = {
  lossy: false,
  mixed: false,
  quality: 75,
  method: 4,
  minimize: false,
  kmin: undefined,
  kmax: undefined,
  filter: undefined,
  metadata: 'xmp',
  multiThreading: false,
};

@processorHoc()
class Gif2webp extends PureComponent {
  static processorName = 'gif2webp';
  static propTypes = {
    form: PropTypes.object,
    config: PropTypes.object,
  };
  static getDerivedStateFromProps(props, state) {
    return Object.assign(state, props.config);
  }
  state = defaultConfig;
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <ProcessItem
          label={'lossy'}
          tooltip={'Encode image using lossy compression.'}
        >
          {getFieldDecorator('lossy', {
            valuePropName: 'checked',
            initialValue: this.state.lossy,
          })(<Switch size="small" />)}
        </ProcessItem>
        <ProcessItem
          label={'mixed'}
          tooltip={
            'For each frame in the image, pick lossy or lossless compression heuristically.'
          }
        >
          {getFieldDecorator('mixed', {
            valuePropName: 'checked',
            initialValue: this.state.mixed,
          })(<Switch size="small" />)}
        </ProcessItem>
        <ProcessItem
          label={'quality'}
          tooltip={'Quality factor between 0 and 100.'}
        >
          {getFieldDecorator('quality', {
            initialValue: this.state.quality,
          })(<Slider max={100} min={0} />)}
        </ProcessItem>
        <ProcessItem
          label={'method'}
          tooltip={
            'Specify the compression method to use, between 0 (fastest) and 6 (slowest).'
          }
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
            />,
          )}
        </ProcessItem>
        <ProcessItem
          label={'minimize'}
          tooltip={'Minimize output size. Lossless compression by default.'}
        >
          {getFieldDecorator('minimize', {
            valuePropName: 'checked',
            initialValue: this.state.minimize,
          })(<Switch size="small" />)}
        </ProcessItem>
        <ProcessItem
          label={'kmin'}
          tooltip={'Min distance between key frames.'}
        >
          {getFieldDecorator('kmin', {
            valuePropName: 'checked',
            initialValue: this.state.kmin,
          })(<InputNumber size="small" />)}
        </ProcessItem>
        <ProcessItem
          label={'kmax'}
          tooltip={'Max distance between key frames.'}
        >
          {getFieldDecorator('kmax', {
            valuePropName: 'checked',
            initialValue: this.state.kmax,
          })(<InputNumber size="small" />)}
        </ProcessItem>
        <ProcessItem
          label={'filter'}
          tooltip={'Filter strength between 0 (off) and 100.'}
        >
          {getFieldDecorator('filter', {
            initialValue: this.state.filter,
          })(<Slider max={100} min={0} />)}
        </ProcessItem>
        <ProcessItem
          label={'metadata'}
          tooltip={
            'Comma separated list of metadata to copy from the input to the output if present.'
          }
        >
          {getFieldDecorator('metadata', {
            initialValue: this.state.metadata,
          })(
            <Select size="small">
              <Option value="all">all</Option>
              <Option value="none">none</Option>
              <Option value="icc">icc</Option>
              <Option value="xmp">xmp</Option>
            </Select>,
          )}
        </ProcessItem>
        <ProcessItem
          label={'multi threading'}
          tooltip={'Use multi-threading if available.'}
        >
          {getFieldDecorator('multiThreading', {
            valuePropName: 'checked',
            initialValue: this.state.multiThreading,
          })(<Switch size="small" />)}
        </ProcessItem>
      </Fragment>
    );
  }
}

export default Gif2webp;
