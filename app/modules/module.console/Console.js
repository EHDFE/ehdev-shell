/**
 * Profile of project
 * @author ryan.bian
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';

import { Popover, Button } from 'antd';


import styles from './index.less';
import Console from '../../components/component.console/';

class ConsoleModule extends Component {
  state = {
    isShow: null
  }
  propTypes = {
    service: PropTypes.object,
  }
  componentDidMount() {

  }
  componentWillReceiveProps(nextProps) {
  }

  consoleToggle() {
    this.setState({
      isShow: !this.state.isShow
    });
  }
  
  render() {
    const { service } = this.props;
    const content = 'show/hide console';
    
    return (
      <div className={styles.Console}>
        <Popover content={content} trigger="hover">
          <Button type="primary" icon="code" className={styles['hover-btn']} onClick={this.consoleToggle.bind(this)}></Button>
        </Popover>
        <div className={`${styles['console-wrap']} ${this.state.isShow ? styles['console-wrap__show']: ''}  ${this.state.isShow === false ? styles['console-wrap__hide']: ''}`}>
          <Console value={service.log}/>
        </div>
      </div>
    );
  }
}

const projectPageSelector = state => state['page.project'];
const envSelector = createSelector(
  projectPageSelector,
  pageState => pageState.env,
);
const serviceSelector = createSelector(
  projectPageSelector,
  pageState => pageState.service,
);

const mapStateToProps = (state) => createSelector(
  envSelector,
  serviceSelector,
  (env, service) => ({
    ...env,
    service,
  }),
);
const mapDispatchToProps = dispatch => ({
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConsoleModule);
