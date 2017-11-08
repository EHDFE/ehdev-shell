import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';



class DependencyManager extends Component {
  render() {
    return <div>DependencyManager</div>;
  }
}

const projectPageSelector = state => state['page.project'];
const envSelector = createSelector(
  projectPageSelector,
  pageState => pageState.env,
);


const mapStateToProps = (state) => createSelector(
  envSelector,

  (env) => ({
    ...env,
  }),
);

export default connect(mapStateToProps)(DependencyManager);