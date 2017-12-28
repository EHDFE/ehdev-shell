/**
 * Runtime Config Modal
 */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Select } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

const PORTS_COUNT = 20;
const AVAILABLE_PORTS_LIST = Array.from(new Array(PORTS_COUNT), (d, i) => 3000 + i);

@Form.create()
class RuntimeConfigModal extends PureComponent {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
    close: PropTypes.func,
    closeWithData: PropTypes.func,
    formData: PropTypes.shape({
      port: PropTypes.number,
    }),
  }
  handleConfirm = () => {
    const fieldsValues = this.props.form.getFieldsValue();
    this.props.closeWithData(fieldsValues);
  }
  handleQuit = () => {
    this.props.close();
  }
  renderForm() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const { formData } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form>
        <FormItem
          {...formItemLayout}
          label="端口"
          extra="设置启动当前开发环境服务的端口号"
        >
          {getFieldDecorator('port', {
            initialValue: formData.port,
          })(
            <Select>
              {
                AVAILABLE_PORTS_LIST.map(p => (
                  <Option key={p} value={p}>{p}</Option>
                ))
              }
            </Select>
          )}
        </FormItem>
      </Form>
    );
  }
  render() {
    const { visible } = this.props;
    const modalProps = {
      title: '运行配置',
      visible,
      onOk: this.handleConfirm,
      onCancel: this.handleQuit,
    };
    return (
      <Modal {...modalProps}>
        { this.renderForm() }
      </Modal>
    );
  }
}

export default RuntimeConfigModal;
