import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import randomColor from 'randomcolor';

import styles from './index.less';

export default class CategoryCircle extends PureComponent {
  static defaultProps = {
    onClick() {},
  }
  static propTypes = {
    data: PropTypes.instanceOf(Map),
    onClick: PropTypes.func,
  }
  handleClick = () => {
    const id = this.props.data.get('_id');
    this.props.onClick(id);
  }
  render() {
    const { data } = this.props;
    const color = randomColor({
      seed: data.get('_id'),
      luminosity: 'light',
    });
    const style = {
      backgroundColor: color,
    };
    return (
      <button
        className={styles.CategoryCircle}
        style={style}
        onClick={this.handleClick}
      >
        {data.get('title')}
      </button>
    );
  }
}
