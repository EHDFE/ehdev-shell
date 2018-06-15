import { PureComponent, Fragment } from 'react';
import { InputNumber, Switch } from 'antd';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import processorHoc from '../processorHoc';
import ProcessItem from '../ProcessItem';

@processorHoc()
export default class Upng extends PureComponent {
  static processorName = 'upng'
  static propTypes = {
    form: PropTypes.object,
    data: PropTypes.instanceOf(Map),
  }
  handleDimensionChange(prop, ratio, value) {
    const fieldsValue = this.props.form.getFieldsValue();
    if (fieldsValue.keepRatio) {
      this.props.form.setFieldsValue({
        [prop]: Math.round(ratio * value),
      });
    }
  }
  render() {
    const { data, form } = this.props;
    const { getFieldDecorator } = form;
    const initialWidth = data.getIn(['dimensions', 'width']);
    const initialHeight = data.getIn(['dimensions', 'height']);
    return (
      <Fragment>
        <ProcessItem
          label={'保持比例'}
        >
          {getFieldDecorator('keepRatio', {
            valuePropName: 'checked',
            initialValue: true,
          })(
            <Switch  />
          )}
        </ProcessItem>
        <ProcessItem
          label={'宽度'}
        >
          {getFieldDecorator('width', {
            initialValue: initialWidth,
          })(
            <InputNumber
              min={1}
              onChange={this.handleDimensionChange.bind(this, 'height', initialHeight / initialWidth)}
            />
          )}
        </ProcessItem>
        <ProcessItem
          label={'高度'}
        >
          {getFieldDecorator('height', {
            initialValue: initialHeight,
          })(
            <InputNumber
              min={1}
              onChange={this.handleDimensionChange.bind(this, 'width', initialWidth / initialHeight)}
            />
          )}
        </ProcessItem>
      </Fragment>
    );
  }
}
