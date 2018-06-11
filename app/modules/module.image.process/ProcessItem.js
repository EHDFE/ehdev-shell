import { PureComponent } from 'react';
import { Form, Tooltip, Icon } from 'antd';
import PropTypes from 'prop-types';
import { formItemLayout } from './processorHoc';

import styles from './index.less';

const FormItem = Form.Item;

export default class ProcessItem extends PureComponent {
  static defaultProps = {
    label: '',
    tooltip: '',
    extra: '',
  }
  static propTypes = {
    label: PropTypes.string.isRequired,
    tooltip: PropTypes.string,
    extra: PropTypes.string,
    children: PropTypes.any,
  }
  render () {
    const { label, tooltip, extra, children } = this.props;
    const props = {
      extra,
    };
    if (tooltip) {
      Object.assign(props, {
        label: (
          <span className={styles.ProcessItem__Label}>
            <s>{label}</s>
            {
              tooltip && (
                <Tooltip title={tooltip}>
                  <Icon type="question-circle-o" />
                </Tooltip>
              )
            }
          </span>
        ),
      });
    } else {
      Object.assign(props, {
        label,
      });
    }
    return (
      <FormItem
        {...formItemLayout}
        {...props}
      >
        { children }
      </FormItem>
    );
  }
}
