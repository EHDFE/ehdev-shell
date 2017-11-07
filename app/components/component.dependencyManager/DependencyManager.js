import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';

export default class DependencyManager extends Component {
  propTypes = {
    rootPath: PropTypes.string
  }
  render() {
    return <div>DependencyManager{this.props.rootPath}</div>;
  }
}
