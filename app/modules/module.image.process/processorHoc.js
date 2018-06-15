import { PureComponent } from 'react';
import { Form, Alert } from 'antd';
import PropTypes from 'prop-types';
import ScrollArea from 'react-scrollbar';


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
      className: PropTypes.string,
    }
    render() {
      const { form, className, ...otherProps } = this.props;
      return (
        <ScrollArea
          className={className}
          speed={0.8}
          horizontal={false}
          smoothScrolling
        >
          <Form>
            {desc && <Alert message={desc} type="info" />}
            <Processor form={form} {...otherProps} />
          </Form>
        </ScrollArea>
      );
    }
  }
  return ProcessorWrapper;
};

export default processorHoc;
