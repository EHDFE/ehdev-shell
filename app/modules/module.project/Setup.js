/**
 * Setup of project
 * @author grootfish
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Input, Switch, Button, Row, Col } from 'antd';
import _ from 'lodash';

const FormItem = Form.Item;

import styles from './index.less';

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

const Config = ({config, getFieldDecorator, prefix=''})=>{
  return (
    Object.keys(config).map(item=>{

      let field = item;
      if (prefix) {
        field = prefix +'.'+ item;
      }

      if (_.isPlainObject(config[item])) {
        return (
          <div key={field}>
            <h3 className={styles.Setup__Title}>{item}</h3>
            <div className={styles.Setup__Item}>
              <Config config={config[item]}
                getFieldDecorator={getFieldDecorator}
                prefix={field}
              />
            </div>
          </div>

        );
      }
      if (_.isArray(config[item])) {

        return (
          <FormItem
            key={field}
            className={styles.Setup__FormItem}
            label={<h3 className={styles.Setup__Label}>{item}</h3>}
            {...itemProps}
          >{getFieldDecorator(field, {
              initialValue: config[item]
            })(<Select mode="tags">
            </Select>)
            }
          </FormItem>
        );
      } else if (_.isString(config[item])) {

        return (
          <FormItem
            key={field}
            className={styles.Setup__FormItem}
            label={<h3 className={styles.Setup__Label}>{item}</h3>}
            {...itemProps}
          >{getFieldDecorator(field, {
              initialValue: config[item]
            })(<Input/>)}
          </FormItem>
        );
      } else if (_.isBoolean(config[item])) {
        return (
          <FormItem
            key={field}
            className={styles.Setup__FormItem}
            label={<h3 className={styles.Setup__Label}>{item}</h3>}
            {...itemProps}
          >
            {getFieldDecorator(field, { valuePropName: 'checked', initialValue: config[item]})(
              <Switch />
            )}
          </FormItem>
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
    <Form layout="vertical">
      <Config config={config} getFieldDecorator={getFieldDecorator}></Config>
    </Form>
  );
});

class Setup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: props.config||{}
    };
  }

  componentWillReceiveProps(nextProps) {
    const { config } = this.props;
    if (nextProps.config && (nextProps.config !== config)) {
      this.setState({
        fields: config
      });
    }
  }

  handleFormChange = () => {
    const changedFields = this.formRef.props.form.getFieldsValue();

    this.setState({
      fields: { ...this.state.fields, ...changedFields },
    });
  }
  // add = (item)=>{
  //   if(item == 'externals'){
  //     const {externals} = this.state.fields;
  //     externals.external = {
  //       'path':'',
  //       'alias': ''
  //     };
  //     this.setState({
  //       fields: { ...this.state.fields, externals }
  //     });
  //   }else if(item == 'proxy'){
  //     const {proxy} = this.state.fields;
  //     proxy.proxy1 = {
  //       'target':'',
  //       'changeOrigin': true
  //     };
  //     this.setState({
  //       fields: { ...this.state.fields, proxy }
  //     });
  //   }
  // }

  // remove = (item)=>{

  //   let {externals,proxy,libiary} = this.state.fields;
  //   const key = item.split('.')[1];

  //   if(item.indexOf('externals')>-1){
  //     delete externals[key];
  //   }else if(item.indexOf('proxy')>-1){
  //     delete proxy[key];
  //   }else if(item.indexOf('libiary')>-1){
  //     delete libiary[key];
  //   }

  //   this.setState({
  //     fields: { ...this.state.fields, externals,proxy,libiary }
  //   });

  // }

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
      <Row gutter={40} className={styles.Setup__Row}>
        <Col {...colProps}>
          <SetupForm config = {fields} onChange={this.handleFormChange}
            remove = {this.remove}
            add={this.add}
            wrappedComponentRef={(inst) => this.formRef = inst}/>
        </Col>
        <Col {...colProps}>
          <pre className="language-bash">
            {JSON.stringify(fields, null, 2)}
          </pre>
        </Col>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Button type="primary" htmlType="submit" onClick={this.handleSubmit}>Submit</Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
            Reset
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
