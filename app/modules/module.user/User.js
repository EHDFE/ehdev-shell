/**
 * User Page
 * @author grootfish
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { Form, Upload, Icon, message, Input, Button, Row, Col } from 'antd';

import { actions } from './store';

import styles from './index.less';

import Page from '../../components/component.page/';
import CityPicker from '../../components/component.cityPicker';

const FormItem = Form.Item;
const FILE_PATH = 'http://image.tf56.com/fastdfsWeb/upload';

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isIMG = file.type.startsWith('image/');
  if (!isIMG) {
    message.error('You can only upload image file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isIMG && isLt2M;
}

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgUrl: '',
    };
  }

  uploadAvatar = info => {
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, imgUrl => {
        this.setState({ imgUrl });
      });
    }
  };

  normFile = e => {
    this.uploadAvatar(e);
    if (e && e.file && e.file.response) {
      return e.file.response.data;
    }
  };

  handleSubmit = e => {
    const { form, setUserInfo } = this.props;
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        // const { avatar, name} = values;
        // window.localStorage.setItem('avatar', avatar);
        // window.localStorage.setItem('name', name);
        const avatar = this.state.imgUrl;
        if (avatar) {
          values.avatar = avatar;
        }
        setUserInfo(values);
        message.success('Update success!');
      }
    });
  };

  render() {
    const { user, form } = this.props;
    const imgUrl = user.get('avatar', this.state.imgUrl);
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { offset: 1, span: 17 },
    };
    return (
      <Page>
        <Form onSubmit={this.handleSubmit} className={styles.User__Card}>
          <Row gutter={10}>
            <Col span={16}>
              <FormItem {...formItemLayout} label="你的昵称">
                {getFieldDecorator('name', {
                  initialValue: user.get('name'),
                  rules: [{ required: true, message: '请输入你的昵称！' }],
                })(<Input placeholder="请输入你的昵称" />)}
              </FormItem>

              <FormItem {...formItemLayout} label="你的github">
                {getFieldDecorator('github', {
                  initialValue: user.get('github'),
                })(<Input placeholder="请输入你的github地址" />)}
              </FormItem>

              <FormItem {...formItemLayout} label="你在哪里">
                {getFieldDecorator('address', {
                  initialValue: user.get('address'),
                })(<CityPicker placeholder='请选择所在城市'/>)}
              </FormItem>

              <FormItem {...formItemLayout} label="你想说的">
                {getFieldDecorator('bio', {
                  initialValue: user.get('bio'),
                })(<Input.TextArea rows={4} placeholder="你想说什么都可以" />)}
              </FormItem>

              <FormItem wrapperCol={{ span: 12, offset: 7 }}>
                <Button type="primary" htmlType="submit">
                    更新个人信息
                </Button>
              </FormItem>

            </Col>
            <Col span={8}>
              <FormItem help="点击上传新头像" style={{ textAlign: 'center' }}>
                {getFieldDecorator('avatar', {
                  initialValue: user.get('avatar'),
                  valuePropName: 'file',
                  getValueFromEvent: this.normFile,
                })(
                  <Upload
                    className={styles.User__avatar_uploader}
                    name="avatar"
                    showUploadList={false}
                    action={FILE_PATH}
                    beforeUpload={beforeUpload}
                    // onChange={this.handleChange}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt=""
                        className={styles.User__avatar}
                      />
                    ) : (
                      <Icon
                        type="plus"
                        className={styles.User__avatar_uploader_trigger}
                      />
                    )}
                  </Upload>
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Page>
    );
  }
}

const UserModule = Form.create()(User);

const mapStateToProps = state => ({
  user: state.get('page.user'),
});
const mapDispatchToProps = dispatch => ({
  setUserInfo: user => dispatch(actions.user.set(user)),
});

User.propTypes = {
  form: PropTypes.object,
  user: PropTypes.object,
  setUserInfo: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserModule);
