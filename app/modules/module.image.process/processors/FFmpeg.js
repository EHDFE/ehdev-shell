import { PureComponent, Fragment } from 'react';
import { Slider, Radio, InputNumber } from 'antd';
import PropTypes from 'prop-types';
import processorHoc, { markGenerator } from '../processorHoc';
import ProcessItem from '../ProcessItem';

export const defaultConfig = {
  target: 'mp4',
  crf: 25,
  vframes: undefined,
  frameRate: undefined,
};

@processorHoc()
class FFmpeg extends PureComponent {
  static processorName = 'ffmpeg';
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
        <ProcessItem label={'输出类型'}>
          {getFieldDecorator('target', {
            initialValue: this.state.target,
          })(
            <Radio.Group>
              <Radio value={'mp4'}>mp4</Radio>
              <Radio value={'webm'}>webm</Radio>
              <Radio value={'gif'}>gif</Radio>
            </Radio.Group>,
          )}
        </ProcessItem>
        <ProcessItem
          label={'画质'}
          extra={'该数字越小，图像质量越好，从主观上讲，18~28是一个合理的范围'}
        >
          {getFieldDecorator('crf', {
            initialValue: this.state.crf,
          })(
            <Slider
              max={51}
              min={0}
              marks={markGenerator(
                { value: 0, label: '高' },
                { value: 51, label: '低' },
              )}
            />,
          )}
        </ProcessItem>
        <ProcessItem label={'帧数'} tooltip={'帧数为0时，输出所有帧'}>
          {getFieldDecorator('vframes', {
            initialValue: this.state.vframes,
          })(<InputNumber size="small" min={0} />)}
        </ProcessItem>
        <ProcessItem label={'输出帧率'} tooltip={'帧数为0时，不指定输出帧率'}>
          {getFieldDecorator('frameRate', {
            initialValue: this.state.frameRate,
          })(<InputNumber size="small" min={1} />)}
        </ProcessItem>
      </Fragment>
    );
  }
}

export default FFmpeg;
