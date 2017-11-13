/**
 * Setting Page
 * @author grootfish
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { Form, Upload, Icon, message, Card, Input, Button } from 'antd';

import { actions } from './store';

import styles from './index.less';

const FormItem = Form.Item;
const FILE_PATH = '/api/upload/file';

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

  componentDidMount() {
    // const {avatar, name} = window.localStorage;
    // this.setState({
    //   avatar, name
    // });
    const {getUserInfo} = this.props;
    getUserInfo();
  }

  uploadAvatar = (info) => {
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, imgUrl =>{
        this.setState({ imgUrl });
      });
    }
  }

  normFile = (e) => {
    this.uploadAvatar(e);
    if (e && e.file && e.file.response) {
      return e.file.response.data;
    }
  }

  handleSubmit = (e) => {
    const {form, setUserInfo} = this.props;
    e.preventDefault();
    form.validateFields((err, values) => {

      if (!err) {
        // const { avatar, name} = values;
        // window.localStorage.setItem('avatar', avatar);
        // window.localStorage.setItem('name', name);
        setUserInfo(values);
        message.success('Update success!');
      }
    });
  }

  render() {
    const {avatar, name} = this.props.user;
    const imgUrl = this.state.imgUrl || avatar;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    return (
      <Card title="个人设置">
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label="你的昵称"
          >
            {
              getFieldDecorator('name', {
                initialValue: name,
                rules: [
                  { required: true, message: '请输入你的昵称！' },
                ],
              })(<Input placeholder="请输入你的昵称" />)
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="你的头像"
            extra="请上传2M以内正确的图片格式"
          >
            {getFieldDecorator('avatar', {
              initialValue: avatar,
              valuePropName: 'file',
              getValueFromEvent: this.normFile,
            })(
              <Upload
                className={styles.Setting__avatar_uploader}
                name="avatar"
                showUploadList={false}
                action={FILE_PATH}
                beforeUpload={beforeUpload}
                // onChange={this.handleChange}
              >
                {
                  imgUrl ?
                    <img src={imgUrl} alt="" className={styles.Setting__avatar} /> :
                    <Icon type="plus" className={styles.Setting__avatar_uploader_trigger} />
                }
              </Upload>
            )
            }
          </FormItem>
          <FormItem
            wrapperCol={{ span: 12, offset: 6 }}
          >
            <Button type="primary" htmlType="submit">提交</Button>
          </FormItem>
        </Form>

      </Card>

    );
  }
}

const UserModule = Form.create()(User);

const PageUserSelector = state => state['page.user'];
const userSelector = createSelector(
  PageUserSelector,
  pageState => pageState.user,
);

const mapStateToProps = state =>createSelector(
  userSelector,
  (user) => ({
    user,
  }),
);
const mapDispatchToProps = dispatch => ({
  getUserInfo: () => dispatch(actions.user.get()),
  setUserInfo: user => dispatch(actions.user.set(user)),
});

User.propTypes = {
  form: PropTypes.object,
  user: PropTypes.object,
  getUserInfo: PropTypes.func,
  setUserInfo: PropTypes.func,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserModule);
