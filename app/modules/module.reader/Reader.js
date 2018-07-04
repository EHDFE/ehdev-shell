import { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Map, Set } from 'immutable';
import { Avatar, Icon } from 'antd';
import CategoryCircle from '../../components/component.category.circle/';
import FeedEditor from './FeedEditor';
import FeedList from './FeedList';

import { actions } from './store';

import styles from './index.less';

class ReaderModule extends PureComponent {
  static propTypes = {
    feedIds: PropTypes.instanceOf(Set),
    currentFeedIds: PropTypes.instanceOf(Set),
    currentFeedId: PropTypes.string,
    categoryIds: PropTypes.instanceOf(Set),
    feedEntity: PropTypes.instanceOf(Map),
    categoryEntity: PropTypes.instanceOf(Map),
    currentStream: PropTypes.instanceOf(Map),
    streamEntity: PropTypes.instanceOf(Map),
    categoryId: PropTypes.string,
    setCategory: PropTypes.func,
    getFeeds: PropTypes.func,
    createCategory: PropTypes.func,
    removeFeed: PropTypes.func,
    selectFeed: PropTypes.func,
  }
  state = {
    feedEditorVisible: false,
    editMode: false,
  }
  componentDidMount() {
    this.props.getFeeds();
  }
  pickCategory = id => {
    this.props.setCategory(id);
  }
  handleAddFeed = () => {
    this.setState({
      feedEditorVisible: true,
    });
  }
  handleDeleteFeed(id) {
    this.props.removeFeed(this.props.categoryId, id);
  }
  handleCloseFeedEditor = () => {
    this.setState({
      feedEditorVisible: false,
    });
  }
  handleToggleMode = () => {
    const { editMode } = this.state;
    this.setState({
      editMode: !editMode,
    });
  }
  handleToggleFeed(id) {
    this.props.selectFeed(id);
  }
  // handleLoadMore = () => {
  //   const { loadOlderStream, currentFeedId, currentStream } = this.props;
  //   loadOlderStream(currentFeedId, {
  //     count: 10,
  //     continuation: currentStream.get('continuation'),
  //   });
  // }
  // loadFeedContent(id) {
  //   const { streamEntity, selectFeed, loadNewerStream } = this.props;
  //   const updated = streamEntity.getIn([id, 'updated'], undefined);
  //   const options = {
  //     count: 20,
  //   };
  //   if (updated > 0) {
  //     Object.assign(options, {
  //       newerThan: updated + 1,
  //     });
  //   }
  //   selectFeed(id);
  //   loadNewerStream(id, options);
  // }
  renderFeedCard(feedId) {
    const { feedEntity } = this.props;
    const { editMode } = this.state;
    return (
      <div
        key={feedId}
        className={styles.Reader__FeedCard}
      >
        <Avatar src={feedEntity.getIn([feedId, 'iconUrl'])} />
        <h5 className={styles['Reader__FeedCard--title']}>{feedEntity.getIn([feedId, 'title'])}</h5>
        {
          editMode ?
            <button
              className={styles['Reader__FeedCard--btn']}
              onClick={this.handleDeleteFeed.bind(this, feedId)}
            >
              <Icon type="close" />
            </button> :
            <button
              className={styles['Reader__FeedCard--btn']}
              onClick={this.handleToggleFeed.bind(this, feedId)}
            >
              <Icon type="right-circle" />
            </button>
        }
      </div>
    );
  }
  renderFeedList() {
    const { currentFeedIds, currentFeedId, currentStream } = this.props;
    return (
      <Fragment>
        <div className={styles.Reader__FeedList}>
          {
            currentFeedIds.map(id => this.renderFeedCard(id))
          }
          <button
            className={styles.Reader__FeedAdder}
            onClick={this.handleAddFeed}
          >
            <Icon type="plus" />
          </button>
        </div>
        <FeedList
          feedId={currentFeedId}
          stream={currentStream}
        />
      </Fragment>
    );
  }
  renderCategory() {
    const { categoryIds, categoryEntity } = this.props;
    return (
      <div className={styles.Reader__CategoryWrapper}>
        {
          categoryIds.map(id => this.renderCategoryItem(categoryEntity.get(id))).toArray()
        }
      </div>
    );
  }
  renderCategoryItem(category) {
    return (
      <CategoryCircle
        key={category.get('_id')}
        data={category}
        onClick={this.pickCategory}
      />
    );
  }
  renderController() {
    const { editMode } = this.state;
    let type;
    if (editMode) {
      type = 'check';
    } else {
      type = 'edit';
    }
    return (
      <div className={styles.Reader__Controller}>
        <button
          className={styles.Reader__ControlBtn}
          onClick={this.handleToggleMode}
        >
          <Icon type={type} />
        </button>
      </div>
    );
  }
  render() {
    const { feedEditorVisible } = this.state;
    return (
      <div className={styles.Reader}>
        { this.renderCategory() }
        { this.renderController() }
        { this.renderFeedList() }
        <FeedEditor
          visible={feedEditorVisible}
          onCancel={this.handleCloseFeedEditor}
        />
      </div>
    );
  }
}
const readerSelector = state => state['page.reader'];
const mapStateToProps = state => createSelector(
  readerSelector,
  pageState => {
    const categoryId = pageState.get('categoryId');
    const currentFeedIds = pageState.getIn(['categoryEntity', categoryId, 'outline'], Set());
    const currentFeedId = pageState.get('feedId');
    return {
      feedIds: pageState.get('feedIds', Set()),
      categoryIds: pageState.get('categoryIds', Set()),
      feedEntity: pageState.get('feedEntity', Map()),
      categoryEntity: pageState.get('categoryEntity', Map()),
      categoryId,
      currentFeedIds,
      currentFeedId,
      streamEntity: pageState.get('streamEntity', Map),
      currentStream: pageState.getIn(['streamEntity', currentFeedId], Map()),
    };
  },
);
const mapDispatchToProps = dispatch => ({
  getFeeds: () => dispatch(actions.getFeeds()),
  removeFeed: (pid, id) => dispatch(actions.removeFeed(pid, id)),
  setCategory: id => dispatch(actions.setCategory(id)),
  selectFeed: id => dispatch(actions.selectFeed(id)),
  createCategory: category => dispatch(actions.createCategory(category)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReaderModule);


