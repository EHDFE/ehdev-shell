import { PureComponent, createContext } from 'react';
import { Form, Alert } from 'antd';
import PropTypes from 'prop-types';
import ScrollArea from 'react-scrollbar';

export const ProcessorContext = createContext('vertical');

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
  @Form.create({
    onFieldsChange(props, fields) {
      const newConfig = {};
      Object.keys(fields).forEach(key => {
        Object.assign(newConfig, {
          [key]: fields[key].value,
        });
      });
      props.onChange(newConfig);
    },
  })
  class ProcessorWrapper extends PureComponent {
    static processorName = Processor.processorName
    static propTypes = {
      form: PropTypes.object,
      className: PropTypes.string,
      config: PropTypes.object,
      layout: PropTypes.string,
    }
    render() {
      const { form, config, className, layout, ...otherProps } = this.props;
      return (
        <ProcessorContext.Provider value={layout}>
          <ScrollArea
            className={className}
            speed={0.8}
            horizontal={false}
            smoothScrolling
          >
            <Form>
              {desc && <Alert message={desc} type="info" />}
              <Processor
                form={form}
                config={config}
                {...otherProps}
              />
            </Form>
          </ScrollArea>
        </ProcessorContext.Provider>
      );
    }
  }
  return ProcessorWrapper;
};

export default processorHoc;
