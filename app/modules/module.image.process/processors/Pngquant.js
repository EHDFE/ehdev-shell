import { PureComponent } from 'react';
import { Form, Slider, Switch } from 'antd';
import PropTypes from 'prop-types';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
  },
};

@Form.create()
export default class Pngquant extends PureComponent {
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
      <Form>
        <FormItem
          {...formItemLayout}
          label="floyd"
          extra={'Controls level of dithering'}
        >
          {getFieldDecorator('floyd', {
            initialValue: this.state.floyd,
          })(
            <Slider
              max={1}
              min={0}
              step={0.1}
              marks={{
                0: 'none',
                1: 'full'
              }}
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="nofs"
          extra={'Disable Floyd-Steinberg dithering.'}
        >
          {getFieldDecorator('nofs', { valuePropName: 'checked' })(
            <Switch />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="quality"
          extra={'Instructs pngquant to use the least amount of colors required to meet or exceed the max quality.If conversion results in quality below the min quality the image won\'t be saved.Min and max are numbers in range 0 (worst) to 100 (perfect), similar to JPEG.'}
        >
          {getFieldDecorator('quality', {
            initialValue: this.state.quality,
          })(
            <Slider
              max={100}
              min={0}
              marks={{
                0: 'worst',
                100: 'perfect'
              }}
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="speed"
          extra={'Speed/quality trade-off from 1 (brute-force) to 10 (fastest). Speed 10 has 5% lower quality, but is 8 times faster than the default.'}
        >
          {getFieldDecorator('speed', {
            initialValue: this.state.speed,
          })(
            <Slider
              max={10}
              min={1}
              marks={{
                1: 'brute-force',
                10: 'fastest'
              }}
            />
          )}
        </FormItem>
      </Form>
    );
  }
}
