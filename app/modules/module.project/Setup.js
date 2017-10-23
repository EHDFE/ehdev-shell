/**
 * Profile of project
 * @author ryan.bian
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Form,Select,Input,Switch,Button,Icon,Row,Col } from 'antd';
import _ from 'lodash';

const FormItem = Form.Item;
const Option = Select.Option;

import styles from './index.less';

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

const Config = ({config,getFieldDecorator,prefix=''})=>{
  return (
    Object.keys(config).map((item,index)=>{
      if(_.isPlainObject(config[item])){
        let field = item;
        if(prefix){
          field = prefix +'.'+ item;
        }
        return (
          <div key={field}>
            <h3 className={styles.Setup__Title}>{item}</h3>
            <div className={styles.Setup__Item}>
              <Config config={config[item]} getFieldDecorator={getFieldDecorator} prefix={field}></Config>
              {(item=='externals'||item=='proxy'||item=='libiary')?
                (<FormItem {...itemProps}>
                  <Button type="dashed" onClick={this.add} style={{ width: '60%' }}>
                    <Icon type="plus" /> Add field
                  </Button>
                </FormItem>):null}
            </div>
          </div>

        );
      }
      if(_.isArray(config[item])){
        let field = item;
        if(prefix){
          field = prefix +'.'+ item;
        }
        return (
          <FormItem
            key={field}
            className={styles.Setup__FormItem}
            label={<h3 className={styles.Setup__Label}>{item}</h3>}
            {...itemProps}
          >{getFieldDecorator(field, {
              initialValue:config[item]
            })(<Select mode="tags">
            </Select>)
            }
          </FormItem>
        );
      }else if(_.isString(config[item])){
        let field = item;
        if(prefix){
          field = prefix +'.'+ item;
        }
        return (
          <FormItem
            key={field}
            className={styles.Setup__FormItem}
            label={<h3 className={styles.Setup__Label}>{item}</h3>}
            {...itemProps}
          >{getFieldDecorator(field, {
              initialValue:config[item]
            })(<Input/>)}
          </FormItem>
        );

      }else if(_.isBoolean(config[item])){
        let field = item;
        if(prefix){
          field = prefix +'.'+ item;
        }
        return (
          <FormItem
            key={field}
            className={styles.Setup__FormItem}
            label={<h3 className={styles.Setup__Label}>{item}</h3>}
            {...itemProps}
          >
            {getFieldDecorator(field, { valuePropName: 'checked' ,initialValue:config[item]})(
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
  const {config } = props;
  const { getFieldDecorator } = props.form;

  return (
    <Form>
      <Config config={config} getFieldDecorator={getFieldDecorator}></Config>
    </Form>
  );
});

class Setup extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      fields:props.config
    };
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
  render() {
    const fields = this.state.fields;
    return (
      <Row gutter={40}>
        <Col {...colProps}>
          <SetupForm config = {fields} onChange={this.handleFormChange} wrappedComponentRef={(inst) => this.formRef = inst}/>
        </Col>
        <Col {...colProps}>
          <pre className="language-bash">
            {JSON.stringify(fields, null, 2)}
          </pre>
        </Col>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Button type="primary" htmlType="submit">Submit</Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
            Reset
          </Button>
        </Col>
      </Row>
    );
  }
}

PropTypes.defaultProps = {
  config:{}
};

Setup.propTypes = {
  config:PropTypes.object
};

export default Setup;
