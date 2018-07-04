import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { Set } from 'immutable';
import { Button, Modal, Input, List, notification, Avatar } from 'antd';

import READER_API from '../../apis/reader';
import { actions } from './store';

const { Search } = Input;

class FeedEditor extends PureComponent {
  static propTypes = {
    visible: PropTypes.bool,
    categoryId: PropTypes.string,
    currentFeedIds: PropTypes.instanceOf(Set),
    onCancel: PropTypes.func,
    onSubscribe: PropTypes.func,
  }
  state = {
    results: [],
    loading: false,
  }
  handleSearchFeed = async value => {
    if (!value) return false;
    try {
      this.setState({
        loading: true,
      });
      const res = await READER_API.search(value);
      this.setState({
        results: res.results,
        loading: false,
      });
    } catch (e) {
      this.setState({
        loading: false,
      });
      notification.error({
        message: '搜索失败',
        description: e.toString(),
      });
    }
  }
  handleSubscribe = data => {
    const { categoryId } = this.props;
    this.props.onSubscribe(categoryId, {
      _id: data.feedId,
      title: data.title,
      type: 'rss',
      xmlUrl: data.feedId.replace(/^feed\//, ''),
      htmlUrl: data.website,
      iconUrl: data.iconUrl,
      visualUrl: data.visualUrl,
      description: data.description,
    });
  }
  renderSearchArea() {
    return (
      <Search
        placeholder="搜索你感兴趣的内容"
        onSearch={this.handleSearchFeed}
        enterButton
      />
    );
  }
  renderContent() {
    const { currentFeedIds } = this.props;
    const { results, loading } = this.state;
    return (
      <List
        size={'small'}
        loading={loading}
        dataSource={results}
        renderItem={item => (
          <List.Item actions={[
            <Button
              key={'subscribe'}
              size={'small'}
              type={'dashed'}
              disabled={currentFeedIds.has(item.feedId)}
              onClick={this.handleSubscribe.bind(this, item)}
            >订阅</Button>
          ]}>
            <List.Item.Meta
              avatar={<Avatar src={item.iconUrl} />}
              title={item.title}
              description={<span style={{ fontSize: 12 }}>{item.description}</span>}
            />

          </List.Item>
        )}
      />
    );
  }
  render() {
    const { visible, onCancel } = this.props;
    const modalProps = {
      visible,
      onCancel,
      closable: false,
      footer: null,
    };
    return (
      <Modal {...modalProps}>
        { this.renderSearchArea() }
        { this.renderContent() }
      </Modal>
    );
  }
}

const readerSelector = state => state['page.reader'];
const mapStateToProps = state => createSelector(
  readerSelector,
  pageState => {
    const categoryId = pageState.get('categoryId');
    return {
      categoryId,
      currentFeedIds: pageState.getIn(['categoryEntity', categoryId, 'outline'], Set()),
    };
  },
);
const mapDispatchToProps = dispatch => ({
  onSubscribe: (pid, data) => dispatch(actions.addFeed(pid, data)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FeedEditor);
