/**
 * Profile of project
 * @author ryan.bian
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col } from 'antd';

const FormItem = Form.Item;

import styles from './index.less';

const Profile = (props) => {
  const { name, version, author, description } = props;
  const itemProps = {
    labelCol: {
      xs: {
        span: 6,
      },
      sm: {
        span: 4
      },
      lg: {
        span: 3,
      },
    },
    wrapperCol: {
      xs: {
        offset: 1,
        span: 17,
      },
      sm: {
        offset: 1,
        span: 19,
      },
      lg: {
        offset: 1,
        span: 18,
      },
    },
    colon: false,
  };
  const colProps = {
    xs: 24,
    sm: 12,
    xl: 8,
  };
  return (
    <Form className={styles.Profile}>
      <Row>
        <Col {...colProps}>
          <FormItem
            label={<h3 className={styles.Profile__Title}>名称</h3>}
            {...itemProps}
          >
            { name }
          </FormItem>
        </Col>
        <Col {...colProps}>
          <FormItem
            label={<h3 className={styles.Profile__Title}>作者</h3>}
            {...itemProps}
          >
            { author }
          </FormItem>
        </Col>
        <Col {...colProps}>
          <FormItem
            label={<h3 className={styles.Profile__Title}>版本号</h3>}
            {...itemProps}
          >
            { version }
          </FormItem>
        </Col>
        <Col {...colProps}>
          <FormItem
            label={<h3 className={styles.Profile__Title}>描述</h3>}
            {...itemProps}
          >
            { description }
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
};

PropTypes.defaultProps = {
  name: '',
  version: '',
  description: '',
  author: '',
};

Profile.propTypes = {
  name: PropTypes.string,
  version: PropTypes.string,
  description: PropTypes.string,
  author: PropTypes.string,
};

export default Profile;
