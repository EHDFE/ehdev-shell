/**
 * AddDev Component
 * @author JeffWong
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import { Modal, Input, Form, Radio } from 'antd';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { coy } from 'react-syntax-highlighter/styles/prism';


const FormItem = Form.Item;

@Form.create()
class AddDev extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    hideModal: PropTypes.func,
    installPkg: PropTypes.func,
    rootPath: PropTypes.string,
    form: PropTypes.object,
  };
  state = {
    confirmLoading: false,
    inputDisabled: true,
    previewCommander: '',
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.setState({
        inputDisabled: true,
        previewCommander: '',
      });
    }
  }
  handleOk = () => {
    const { form, rootPath, installPkg, hideModal } = this.props;
    this.handleValidateForm()
      .then(values => {
        this.setState({
          confirmLoading: true,
        });
        const { type, packageName, version, mode } = values;
        const packages = [];
        if (type === 'specific') {
          packages.push(`${packageName}@${version ? version : 'latest'}`);
        }
        installPkg(
          packages,
          rootPath,
          mode,
        ).then(data => {
          this.setState({
            confirmLoading: false,
          });
          form.resetFields();
          hideModal();
        });
      });
  };
  handleCancel = () => {
    if (this.state.confirmLoading) {
      return false;
    }
    this.props.form.resetFields();
    this.props.hideModal();
  }
  handleFormChange = () => {
    const { type, packageName, version, mode } = this.props.form.getFieldsValue();
    let previewCommander = 'npm install ';
    if (type === 'specific') {
      if (packageName) {
        previewCommander += packageName;
        if (version) {
          previewCommander += `@${version}`;
        }
      }
      previewCommander += ` ${mode}`;
    }
    this.setState({
      previewCommander,
    });
  }
  handleChangeType = e => {
    const value = e.target.value;
    let inputDisabled;
    if (value === 'specific') {
      inputDisabled = false;
    } else {
      inputDisabled = true;
    }
    this.setState({
      inputDisabled,
    });
  }
  handleValidateForm() {
    return new Promise((resolve, reject) => {
      this.props.form.validateFields((err, values) => {
        if (err) {
          return reject(err);
        }
        resolve(values);
      });
    });
  }
  renderConfig() {
    const { getFieldDecorator } = this.props.form;
    const { inputDisabled } = this.state;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    return (
      <Form
        ref={form => this.form = form}
        onChange={this.handleFormChange}
      >
        <FormItem
          {...formItemLayout}
          label="安装类型"
        >
          {getFieldDecorator('type', {
            rules: [{ required: true, message: '你倒是选一个啊！' }],
          })(
            <Radio.Group onChange={this.handleChangeType}>
              <Radio.Button value="all">所有依赖</Radio.Button>
              <Radio.Button value="specific">指定依赖</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="依赖名"
        >
          {getFieldDecorator('packageName', {
            rules: [{ required: !inputDisabled, message: '不填我怎么知道你要装什么！' }]
          })(
            <Input placeholder="例如 react" disabled={inputDisabled} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="依赖版本"
        >
          {getFieldDecorator('version')(
            <Input placeholder="例如 16.0.0 或 beta" disabled={inputDisabled} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="安装模式"
        >
          {getFieldDecorator('mode', {
            initialValue: '-S',
            rules: [{ required: !inputDisabled, message: '还是选一个吧' }]
          })(
            <Radio.Group disabled={inputDisabled}>
              <Radio value="-S">-S(--save)</Radio>
              <Radio value="-D">-D(--save-dev)</Radio>
              <Radio value="-O">-O(--save-optional)</Radio>
              <Radio value="--no-save">--no-save</Radio>
            </Radio.Group>
          )}
        </FormItem>
      </Form>
    );
  }
  render() {
    const { visible } = this.props;
    const { confirmLoading, previewCommander } = this.state;
    return (
      <Modal
        title="添加依赖"
        visible={visible}
        onOk={this.handleOk}
        confirmLoading={confirmLoading}
        onCancel={this.handleCancel}
        closable={false}
      >
        <div className={styles.AddDev__Preview}>
          <SyntaxHighlighter language='bash' style={coy}>
            {previewCommander}
          </SyntaxHighlighter>
        </div>
        { this.renderConfig() }
      </Modal>
    );
  }
}

export default AddDev;
