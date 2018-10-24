/**
 * Qr Code generator module
 * @author ryan.bian
 */
import { Button, Form, Icon, Input } from 'antd';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import styles from './index.less';
import { actions } from './store';

const { Item } = Form;
const { TextArea } = Input;

@Form.create({})
class QrCodeModule extends PureComponent {
  static propTypes = {
    url: PropTypes.string,
    form: PropTypes.object,
    generate: PropTypes.func,
  };
  state = {};
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.generate(values.text);
      }
    });
  };
  render() {
    const { url, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div className={styles.QrCode}>
        <div className={styles.QrCode__Result}>
          <figure className={styles.QrCode__Figure}>
            {url ? (
              <img src={url} alt="" />
            ) : (
              <em className={styles.QrCode__EmptyTip}>
                左侧输入内容，点击生成二维码
              </em>
            )}
            <div className={styles.QrCode__Actions}>
              <a href={url} download="qrcode.png">
                <Icon type="download" />
              </a>
            </div>
          </figure>
        </div>
        <Form className={styles.QrCode__Form} onSubmit={this.handleSubmit}>
          <Item required>
            {getFieldDecorator('text', {
              rules: [{ required: true, message: '内容不能为空' }],
            })(
              <TextArea
                placeholder="在这里输入待生成二维码的内容"
                autosize={{ minRows: 4 }}
              />,
            )}
          </Item>
          <Item>
            <div className={styles.QrCode__FormAction}>
              <Button type="primary" htmlType="submit">
                生成二维码
              </Button>
            </div>
          </Item>
        </Form>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  url: state['page.qrcode'].get('url'),
});

const mapDispatchToProps = dispatch => ({
  generate: text => dispatch(actions.generate(text)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(QrCodeModule);
