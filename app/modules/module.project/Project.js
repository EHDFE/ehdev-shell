/**
 * Project Module
 * @author ryan.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { actions } from './store';

import styles from './index.less';

import FolderPicker from '../../components/component.folderPicker/';
import DependencyManager from '../../components/component.dependencyManager/';

class ProjectModule extends Component {
  propTypes = {
    rootPath: PropTypes.string,
    getEnvData: PropTypes.func,
    setRootPath: PropTypes.func,
  }
  componentDidMount() {
    const { rootPath } = this.props;
    if (rootPath) {
      this.props.getEnvData(rootPath);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.rootPath && (nextProps.rootPath !== this.props.rootPath)) {
      this.props.getEnvData(nextProps.rootPath);
    }
  }
  render() {
    const { setRootPath } = this.props;
    return <div>
      ProjectModule
      <FolderPicker onChange={value => {
        setRootPath(value);
      }} />
      <DependencyManager />
    </div>;
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
const mapDispatchToProps = dispatch => ({
  setRootPath: rootPath => dispatch(actions.env.setRootPath(rootPath)),
  getEnvData: rootPath => dispatch(actions.env.getEnv(rootPath)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectModule);
