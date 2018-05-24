/**
 * Command Palette Module
 * @author ryan.bian
 */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { filter, wrap } from 'fuzzaldrin-plus';
import { createSelector } from 'reselect';
import { List } from 'immutable';

import styles from './index.less';
import EnvUtils from '../../utils/env';
import commandManager from '../../service/command';

import { actions as projectAction } from '../module.project';

const ITEM_HEIGHT = 28;
const DISPLAY_ITEM_COUNT = 10;
const DISPLAY_ITEMS_CONTAINER_HEIGHT = ITEM_HEIGHT * DISPLAY_ITEM_COUNT;

const SEARCH_FILTER_CONFIG = {
  key: 'name',
};

class CommandPalette extends PureComponent {
  static defaultProps = {
    setProjectRoot() {},
    projectHistory: List([]),
  }
  static propTypes = {
    setProjectRoot: PropTypes.func,
    projectHistory: PropTypes.instanceOf(List),
  }
  state = {
    active: false,
    focusIndex: 0,
    search: '>',
    mode: 'command',
    data: List([]),
  }
  componentDidMount() {
    this.getRegistedCommands();
    this.bindGlobalEvents();
  }
  componentDidUpdate() {
    if (this.state.active) {
      this.inputField.focus();
    }
  }
  componentWillUnmount() {
    this.unbindGlobalEvents();
  }
  getRegistedCommands() {
    this.setState({
      data: List(commandManager.getCommands()),
    });
  }
  bindGlobalEvents() {
    this.maskNode.addEventListener('click', this.handleCloseMask, false);
    this.dropdownNode.addEventListener('click', this.handleItemClick, false);
    window.addEventListener('keydown', this.handleKeyboardEvents, false);
  }
  unbindGlobalEvents() {
    this.maskNode.removeEventListener('click', this.handleCloseMask, false);
    this.dropdownNode.removeEventListener('click', this.handleItemClick, false);
    window.removeEventListener('keydown', this.handleKeyboardEvents, false);
  }
  handleItemClick = e => {
    let clickNode = e.target;
    while (
      clickNode !== this.dropdownNode
      && !clickNode.dataset.content
    ) {
      clickNode = clickNode.parentElement;
    }
    if (clickNode.dataset.content) {
      this.handleConfirm(clickNode.dataset.content);
    }
  }
  handleKeyboardEvents = e => {
    const { active } = this.state;
    const keyCode = e.keyCode;
    let matchNode;
    switch (keyCode) {
    case 13:
      // enter
      if (active) {
        e.preventDefault();
        matchNode = this.dropdownNode.querySelector(`.${styles.CommandPalette__Item}[data-index="${[this.state.focusIndex]}"]`);
        if (matchNode) {
          this.handleConfirm(matchNode.dataset.content);
        }
      }
      break;
    case 27:
      // esc
      if (active) {
        e.preventDefault();
        this.hide();
      }
      break;
    case 40:
      // arrow down
      if (active) {
        e.preventDefault();
        this.moveDown();
      }
      break;
    case 38:
      // arrow up
      if (active) {
        e.preventDefault();
        this.moveUp();
      }
      break;
    case 80:
      // p
      if (EnvUtils.isMac && e.metaKey || !EnvUtils.isMac && e.ctrlKey) {
        if (e.shiftKey) {
          // commander + shift + p in Mac
          // ctrl + shift + p in windows
          // open commands
          this.setState({
            active: true,
            search: '>',
            mode: 'command',
            focusIndex: 0,
          });
        } else {
          // open recently project
          this.setState({
            active: true,
            search: '',
            mode: 'recents',
            focusIndex: 0,
          });
        }
      }
      break;
    default:
      break;
    }
  }
  handleCloseMask = e => {
    if (e.target === this.maskNode) {
      this.hide();
    }
  }
  handleConfirm(command) {
    const { mode } = this.state;
    if (mode === 'command') {
      commandManager.emitCommand(command);
    } else if (mode === 'recents') {
      this.props.setProjectRoot(command);
    }
    this.hide();
  }
  handleSearchUpdate = e => {
    const value = e.target.value;
    let mode;
    if (value.startsWith('>')) {
      mode = 'command';
    } else {
      mode = 'recents';
    }
    this.setState({
      search: e.target.value,
      mode,
      focusIndex: 0,
    });
  }
  setFocus(index) {
    this.setState({
      focusIndex: index,
    }, () => {
      const { scrollTop } = this.scrollBar.getValues();
      const viewHeight = this.scrollBar.getClientHeight();
      const ACTIVE_ITEM_OFFSET = ITEM_HEIGHT * index;
      if (ACTIVE_ITEM_OFFSET + ITEM_HEIGHT >= viewHeight + scrollTop) {
        this.scrollBar.scrollTop(ACTIVE_ITEM_OFFSET + ITEM_HEIGHT - viewHeight);
      } else if (ACTIVE_ITEM_OFFSET <= scrollTop) {
        this.scrollBar.scrollTop(ACTIVE_ITEM_OFFSET);
      }
    });
  }
  moveDown() {
    const { focusIndex, mode } = this.state;
    let data;
    if (mode === 'command') {
      data = this.state.data;
    } else {
      data = this.props.projectHistory;
    }
    let nextIndex;
    if (focusIndex === data.size - 1) {
      nextIndex = 0;
    } else {
      nextIndex = focusIndex + 1;
    }
    this.setFocus(nextIndex);
  }
  moveUp() {
    const { focusIndex, mode } = this.state;
    let data, nextIndex;
    if (mode === 'command') {
      data = this.state.data;
    } else {
      data = this.props.projectHistory;
    }
    if (focusIndex === 0) {
      nextIndex = data.size - 1;
    } else {
      nextIndex = focusIndex - 1;
    }
    this.setFocus(nextIndex);
  }
  hide() {
    this.setState({
      active: false,
    });
  }
  renderBody() {
    const { search } = this.state;
    return (
      <div className={classnames(styles.CommandPalette__Body)}>
        <input
          ref={node => this.inputField = node}
          className={classnames(styles.CommandPalette__InputField)}
          type="text"
          onChange={this.handleSearchUpdate}
          value={search}
        />
      </div>
    );
  }
  renderDropdown() {
    const { mode, focusIndex, search } = this.state;
    let matchResult, searchKeys, data;
    if (mode === 'command') {
      searchKeys = search.replace(/^>/, '');
      data = this.state.data.toJS();
    } else if (mode === 'recents') {
      searchKeys = search;
      data = this.props.projectHistory.toJS();
    }
    if (searchKeys.length > 0) {
      matchResult = filter(
        data,
        searchKeys,
        {
          ...SEARCH_FILTER_CONFIG,
        },
      ).map(d => Object.assign({}, d, {
        name: wrap(d.name, searchKeys),
      }));
    } else {
      matchResult = data;
    }
    return (
      <div
        ref={node => this.dropdownNode = node}
        className={classnames(styles.CommandPalette__Dropdown)}
      >
        <Scrollbars
          ref={node => this.scrollBar = node}
          style={{ width: 500 }}
          autoHeight
          autoHeightMax={DISPLAY_ITEMS_CONTAINER_HEIGHT}
          hideTracksWhenNotNeeded
          autoHide
        >
          {
            matchResult.map((d, i) => (
              <div
                key={d.id}
                data-index={i}
                data-content={d.content}
                className={classnames(styles.CommandPalette__Item, {
                  [styles['CommandPalette__Item--focus']]: focusIndex === i,
                })}
              >
                <div
                  className={styles.CommandPalette__CommandName}
                  dangerouslySetInnerHTML={{
                    __html: d.name,
                  }}
                />
                <div
                  className={styles.CommandPalette__Shortcut}
                  dangerouslySetInnerHTML={{
                    __html: d.shortcut,
                  }}
                />
              </div>
            ))
          }
        </Scrollbars>
      </div>
    );
  }
  render() {
    const { active } = this.state;
    return (
      <div
        className={classnames(
          styles['CommandPalette__Mask'],
          {
            [styles['CommandPalette--active']]: active,
          }
        )}
        ref={node => this.maskNode = node}
      >
        <div className={styles.CommandPalette__Ctrl}>
          { this.renderBody() }
          { this.renderDropdown() }
        </div>
      </div>
    );
  }
}

const recentSelector = state => state['page.dashboard'];
const recentProjects = createSelector(
  recentSelector,
  state => state.getIn(['projects', 'statistic'], List())
    .sort((a, b) => {
      return a.get('lastTime') > b.get('lastTime') ? 1 : -1;
    })
    .map(d => ({
      name: d.get('projectPath'),
      lastTime: d.get('lastTime'),
      id: d.get('_id'),
      content: d.get('projectPath'),
    }))
);

const mapStateToProps = state => ({
  projectHistory: recentProjects(state),
});
const mapDispatchToProps = dispatch => ({
  setProjectRoot: rootPath => dispatch(projectAction.env.setRootPath(rootPath)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CommandPalette);
