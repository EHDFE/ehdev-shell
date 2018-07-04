/**
 * Runtime Config Modal
 */
import { Form, Modal, Select, Switch } from 'antd';
import { Map } from 'immutable';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

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
    formData: PropTypes.instanceOf(Map),
  }
  handleConfirm = () => {
    const fieldsValues = this.props.form.getFieldsValue();
    this.props.closeWithData(fieldsValues);
  }
  handleQuit = () => {
    this.props.close();
  }
  // bugfix: prevent selected value from being setting to the initialValue.
  handleSelectChange = value => {
    setTimeout(() => {
      this.props.form.setFieldsValue({
        port: value
      });
    }, 0);
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
          extra="设置启动当前开发环境的端口号"
        >
          {getFieldDecorator('port', {
            initialValue: formData.get('port'),
          })(
            <Select onChange={this.handleSelectChange}>
              {
                AVAILABLE_PORTS_LIST.map(p => (
                  <Option key={p} value={p}>{p}</Option>
                ))
              }
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="启用HTTPS"
        >
          {getFieldDecorator('https', {
            initialValue: formData.get('https'),
            valuePropName: 'checked',
          })(
            <Switch />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="noInfo"
          help="只显示错误和警告信息"
        >
          {getFieldDecorator('noInfo', {
            initialValue: true,
            valuePropName: 'checked',
          })(
            <Switch />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="分析"
          help="打开依赖分析"
        >
          {getFieldDecorator('analyzer', {
            initialValue: false,
            valuePropName: 'checked',
          })(
            <Switch />
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
      zIndex: 1031,
    };
    return (
      <Modal {...modalProps}>
        { this.renderForm() }
      </Modal>
    );
  }
}

export default RuntimeConfigModal;
