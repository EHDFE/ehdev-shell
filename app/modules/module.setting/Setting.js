/**
 * Setting Module
 * @author: ryan.bian
 */
import { PureComponent } from 'react';
import { Set } from 'immutable';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Switch } from 'antd';
import { actions } from './store';

import { GLOBAL_NAV_CONFIG } from '../../CONFIG';

const CONFIGURABLE_CONFIG = GLOBAL_NAV_CONFIG.filter(d => d.configurable);

import styles from './index.less';

class SettingModule extends PureComponent {
  static defaultProps = {
    enabledModules: Set(),
  };
  static propTypes = {
    enabledModules: PropTypes.instanceOf(Set),
    enableModule: PropTypes.func,
    disableModule: PropTypes.func,
  };
  handleToggleModule(name, checked) {
    if (checked) {
      this.props.enableModule(name);
    } else {
      this.props.disableModule(name);
    }
  }
  renderModuleCard(data) {
    const { enabledModules } = this.props;
    return (
      <div
        key={data.to}
        className={styles.Setting__ModuleCard}
      >
        <h4 className={styles.Setting__ModuleCardName}>{data.text}</h4>
        <Switch
          className={styles.Setting__ModuleCardToggle}
          checked={enabledModules.has(data.to)}
          size="small"
          onChange={this.handleToggleModule.bind(this, data.to)}
        />
        <p className={styles.Setting__ModuleCardDesc}>{data.description}</p>
      </div>
    );
  }
  renderModuleCards() {
    return (
      <section className={styles.Setting__ModuleSelect}>
        {
          CONFIGURABLE_CONFIG.map(d => (
            this.renderModuleCard(d)
          ))
        }
      </section>
    );
  }
  render() {
    return (
      <div className={styles.Setting}>
        { this.renderModuleCards() }
      </div>
    );
  }
}

const settingSelector = state => state['page.setting'];
const mapStateToProps = state => createSelector(
  settingSelector,
  pageState => ({
    enabledModules: pageState.get('enabledModules'),
  }),
);

const mapDispatchToProps = dispatch => ({
  enableModule: name => dispatch(actions.enableModule(name)),
  disableModule: name => dispatch(actions.disableModule(name)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingModule);
