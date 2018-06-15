import { PureComponent } from 'react';
import { Form } from 'antd';
import PropTypes from 'prop-types';

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
    extra: PropTypes.any,
    children: PropTypes.any,
  }
  render () {
    const { label, tooltip, extra, children } = this.props;
    const props = {
      extra,
      colon: false,
    };
    Object.assign(props, {
      label: (
        <span className={styles.ProcessItem__Label}>
          <s>{label}</s>
          { tooltip && <i className={styles.ProcessItem__LabelTooltip}>{tooltip}</i> }
        </span>
      ),
    });
    return (
      <FormItem
        {...props}
      >
        { children }
      </FormItem>
    );
  }
}
