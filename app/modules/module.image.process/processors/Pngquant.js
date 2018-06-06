import { PureComponent, Fragment } from 'react';
import { Slider, Switch } from 'antd';
import PropTypes from 'prop-types';
import processorHoc, { markGenerator } from '../processorHoc';
import ProcessItem from '../ProcessItem';

@processorHoc
export default class Pngquant extends PureComponent {
  static processorName = 'pngquant'
  static propTypes = {
    form: PropTypes.object,
  }
  state = {
    floyd: 0.5,
    nofs: false,
    quality: 80,
    speed: 3,
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <ProcessItem
          label={'floyd'}
          tooltip={'Controls level of dithering'}
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
          tooltip={'Disable Floyd-Steinberg dithering.'}
        >
          {getFieldDecorator('nofs', {
            valuePropName: 'checked',
            initialValue: this.state.nofs,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'quality'}
          tooltip={'Instructs pngquant to use the least amount of colors required to meet or exceed the max quality.If conversion results in quality below the min quality the image won\'t be saved.'}
          extra={'Min and max are numbers in range 0 (worst) to 100 (perfect), similar to JPEG.'}
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
          label={'speed'}
          tooltip={'Speed/quality trade-off from 1 (brute-force) to 10 (fastest). Speed 10 has 5% lower quality, but is 8 times faster than the default.'}
        >
          {getFieldDecorator('speed', {
            initialValue: this.state.speed,
          })(
            <Slider
              max={10}
              min={1}
              marks={markGenerator(
                { label: 'brute-force', value: 1 },
                { label: 'fastest', value: 10 },
              )}
            />
          )}
        </ProcessItem>
      </Fragment>
    );
  }
}
