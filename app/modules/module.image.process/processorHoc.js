import { PureComponent } from 'react';
import { Form, Alert } from 'antd';
import PropTypes from 'prop-types';

export const formItemLayout = {
  labelCol: {
    xs: { span: 7 },
    sm: { span: 6 },
    lg: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 17 },
    sm: { span: 16 },
    lg: { span: 15 },
  },
};

export const markGenerator = (from, to) => ({
  [from.value]: {
    style: {
      color: '#ff4d4f',
    },
    label: from.label,
  },
  [to.value]: {
    style: {
      color: '#52c41a',
    },
    label: to.label,
  }
});

const processorHoc = desc => Processor => {
  @Form.create()
  class ProcessorWrapper extends PureComponent {
    static processorName = Processor.processorName
    static propTypes = {
      form: PropTypes.object,
    }
    render() {
      const { form } = this.props;
      return (
        <Form>
          {desc && <Alert message={desc} type="info" />}
          <Processor form={form} />
        </Form>
      );
    }
  }
  return ProcessorWrapper;
};

export default processorHoc;
