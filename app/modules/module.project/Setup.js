/**
 * Setup of project
 * @author grootfish
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Input, Switch, Button, Row, Col, Card  } from 'antd';
import _ from 'lodash';

const FormItem = Form.Item;

import styles from './index.less';

const itemProps = {
  labelCol: {
    xs: {
      offset: 1,
      span: 9,
    },
    sm: {
      offset: 1,
      span: 7,
    },
    lg: {
      offset: 1,
      span: 5,
    },
  },
  wrapperCol: {
    xs: {
      span: 14,
    },
    sm: {
      span: 16,
    },
    lg: {
      span: 18,
    },
  },

};

const colProps = {
  xs: 24,
  sm: 12,
  xl: 12,
};

const Config = ({config, getFieldDecorator, prefix = ''})=>{
  return (
    Object.keys(config).map(item=>{

      let field = item;
      if (prefix) {
        field = prefix + '.' + item;
      }

      if (_.isPlainObject(config[item])) {
        return (
          <Card title={item} noHovering key={field} className={styles.Setup__Card} bordered={false}>
            <Config config={config[item]}
              getFieldDecorator={getFieldDecorator}
              prefix={field}
            />
          </Card>
        );
      }
      if (_.isArray(config[item])) {

        return (
          <Card noHovering className={styles.Setup__Card} bordered={false}>
            <FormItem
              key={field}
              className={styles.Setup__FormItem}
              label={item}
              {...itemProps}
            >
              {getFieldDecorator(field, {
                initialValue: config[item]
              })(
                <Select mode="tags"></Select>
              )
              }
            </FormItem>
          </Card>
        );
      } else if (_.isString(config[item])) {

        return (
          <Card noHovering className={styles.Setup__Card} bordered={false}>
            <FormItem
              key={field}
              className={styles.Setup__FormItem}
              label={item}
              {...itemProps}
            >{getFieldDecorator(field, {
                initialValue: config[item]
              })(<Input/>)}
            </FormItem>
          </Card>
        );
      } else if (_.isBoolean(config[item])) {
        return (
          <Card noHovering className={styles.Setup__Card}>
            <FormItem
              key={field}
              className={styles.Setup__FormItem}
              label={item}
              {...itemProps}
            >
              {getFieldDecorator(field, { valuePropName: 'checked', initialValue: config[item]})(
                <Switch />
              )}
            </FormItem>
          </Card>
        );
      }

    })
  );
};

const SetupForm = Form.create({
  onFieldsChange(props, changedFields) {
    props.onChange();
  },

})((props) => {
  const {config} = props;
  const { getFieldDecorator } = props.form;

  return (
    <Form>
      <Config config={config} getFieldDecorator={getFieldDecorator}></Config>
    </Form>
  );
});

class Setup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: props.config || {}
    };
  }

  componentDidMount() {
    const {config} = this.props;
    this.setState({
      fields: config
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.config) {
      this.setState({
        fields: nextProps.config
      });
    }
  }

  handleFormChange = () => {
    const changedFields = this.formRef.props.form.getFieldsValue();

    this.setState({
      fields: { ...this.state.fields, ...changedFields },
    });
  }


  handleReset = ()=>{
    const {config} = this.props;
    this.setState({
      fields: config,
    });
    this.formRef.props.form.setFieldsValue(config);
  }

  handleSubmit = ()=>{
    const {fields} = this.state;
    this.props.onSubmit(fields);
  }

  render() {
    const fields = this.state.fields;
    return (
      <Row gutter={10} className={styles.Setup__Row}>
        <Col {...colProps}>
          <SetupForm config = {fields} onChange={this.handleFormChange}
            remove = {this.remove}
            add={this.add}
            wrappedComponentRef={(inst) => this.formRef = inst}/>
        </Col>
        <Col {...colProps}>
          <pre className={styles.Setup__Bash}>
            {JSON.stringify(fields, null, 2)}
          </pre>
        </Col>
        <Col span={24} className={styles.Setup__Button}>
          <Button type="primary" htmlType="submit" size="large" onClick={this.handleSubmit}>提交</Button>
          <Button style={{ marginLeft: 20 }} size="large" onClick={this.handleReset}>
            重置
          </Button>
        </Col>
      </Row>
    );
  }
}

PropTypes.defaultProps = {
  config: {},
  onSubmit: undefined,
};

Setup.propTypes = {
  config: PropTypes.object,
  onSubmit: PropTypes.func
};

export default Setup;
