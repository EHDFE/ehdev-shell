import { PureComponent, Fragment } from 'react';
import { Slider, Switch } from 'antd';
import PropTypes from 'prop-types';
import processorHoc from '../processorHoc';
import ProcessItem from '../ProcessItem';

@processorHoc()
export default class Gifsicle extends PureComponent {
  static processorName = 'gifsicle'
  static propTypes = {
    form: PropTypes.object,
  }
  state = {
    interlaced: false,
    optimizationLevel: 1,
    colors: undefined,
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <ProcessItem
          label={'interlaced'}
          tooltip={'Interlace gif for progressive rendering.'}
        >
          {getFieldDecorator('interlaced', {
            valuePropName: 'checked',
            initialValue: this.state.interlaced,
          })(
            <Switch />
          )}
        </ProcessItem>
        <ProcessItem
          label={'optimization level'}
          tooltip={'Select an optimization level between 1 and 3.'}
          extra={'The optimization level determines how much optimization is done; higher levels take longer, but may have better results.'}
        >
          {getFieldDecorator('optimizationLevel', {
            initialValue: this.state.optimizationLevel,
          })(
            <Slider
              max={3}
              min={1}
              step={1}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'colors'}
          tooltip={'Reduce the number of distinct colors in each output GIF to num or less. Num must be between 2 and 256.'}
        >
          {getFieldDecorator('colors', {
            initialValue: this.state.colors,
          })(
            <Slider
              max={256}
              min={2}
            />
          )}
        </ProcessItem>
      </Fragment>
    );
  }
}
