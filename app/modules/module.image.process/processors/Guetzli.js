import { PureComponent, Fragment } from 'react';
import { Slider, Switch, InputNumber } from 'antd';
import PropTypes from 'prop-types';
import processorHoc from '../processorHoc';
import ProcessItem from '../ProcessItem';

@processorHoc('Guetzli 生成的图片比由 libjpeg 生成的质量接近的图片体积要小 20-30%')
export default class Guetzli extends PureComponent {
  static processorName = 'guetzli'
  static propTypes = {
    form: PropTypes.object,
  }
  state = {
    quality: 95,
    memlimit: 6000,
    nomemlimit: undefined,
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <ProcessItem
          label={'quality'}
          tooltip={'Set quality in units equivalent to libjpeg quality. As per guetzli function and purpose, it is not recommended to go below 84.'}
          extra={'Please note that JPEG images do not support alpha channel (transparency). If the input is a PNG with an alpha channel, it will be overlaid on black background before encoding.'}
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
          label={'memlimit'}
          tooltip={'Memory limit in MB. Guetzli will fail if unable to stay under the limit.'}
        >
          {getFieldDecorator('memlimit', {
            initialValue: this.state.memlimit,
          })(
            <InputNumber min={1} />
          )}
        </ProcessItem>
        <ProcessItem
          label={'nomemlimit'}
          tooltip={'Do not limit memory usage.'}
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
