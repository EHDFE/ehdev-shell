/**
 * Setup of project
 * @author grootfish
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Input, Switch, Button, Row, Col, Card } from 'antd';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { coy } from 'react-syntax-highlighter/styles/prism';

const FormItem = Form.Item;

import styles from '../index.less';

const itemProps = {
  labelCol: {
    xs: {
      span: 9,
    },
    sm: {
      span: 7,
    },
    lg: {
      span: 5,
    },
  },
  wrapperCol: {
    xs: {
      offset: 1,
      span: 14,
    },
    sm: {
      offset: 1,
      span: 16,
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
  xl: 12,
};

const Config = ({ config, getFieldDecorator, prefix = '' })=>{
  return (
    Object.keys(config).map(item=>{

      let field = item;
      if (prefix) {
        field = prefix + '.' + item;
      }

      if (isPlainObject(config[item])) {
        return (
          <Card title={item} key={field} className={styles.Setup__Card} bordered={false}>
            <Config config={config[item]}
              getFieldDecorator={getFieldDecorator}
              prefix={field}
            />
          </Card>
        );
      }
      if (Array.isArray(config[item])) {
        return (
          <Card className={styles.Setup__Card} bordered={false} key={field}>
            <FormItem
              key={field}
              className={styles.Setup__FormItem}
              label={item}
              {...itemProps}
            >
              {getFieldDecorator(field, {
                initialValue: config[item].map(d => {
                  if (isString(d)) return d;
                  return JSON.stringify(d);
                })
              })(
                <Select mode="tags"></Select>
              )
              }
            </FormItem>
          </Card>
        );
      } else if (isString(config[item])) {
        return (
          <Card className={styles.Setup__Card} bordered={false} key={field}>
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
      } else if (isBoolean(config[item])) {
        return (
          <Card className={styles.Setup__Card} key={field}>
            <FormItem
              key={field}
              className={styles.Setup__FormItem}
              label={item}
              {...itemProps}
            >
              {getFieldDecorator(field, { valuePropName: 'checked', initialValue: config[item] })(
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
  const { config } = props;
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
    const { config } = this.props;
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
    const changedFields = this.form.getFieldsValue();

    this.setState({
      fields: { ...this.state.fields, ...changedFields },
    });
  }


  handleReset = ()=>{
    const { config } = this.props;
    this.setState({
      fields: config,
    });
    this.form.setFieldsValue(config);
  }

  handleSubmit = ()=>{
    const { fields } = this.state;
    this.props.onSubmit(fields);
  }

  render() {
    const fields = this.state.fields;
    return (
      <Row gutter={10} className={styles.Setup}>
        <Col {...colProps}>
          <SetupForm config = {fields} onChange={this.handleFormChange}
            remove = {this.remove}
            add={this.add}
            ref={(inst) => this.form = inst}/>
        </Col>
        <Col {...colProps}>
          <SyntaxHighlighter language="javascript" style={coy}>{JSON.stringify(fields, null, 2)}</SyntaxHighlighter>
          <Col span={24} className={styles.Setup__Button}>
            <Button type="primary" htmlType="submit" size="large" onClick={this.handleSubmit}>提交</Button>
            <Button style={{ marginLeft: 20 }} size="large" onClick={this.handleReset}>
            重置
            </Button>
          </Col>
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
