import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Map, Set } from 'immutable';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { ArrowKeyStepper, CellMeasurer, CellMeasurerCache, InfiniteLoader, AutoSizer, List } from 'react-virtualized';
import ContentLoader from 'react-content-loader';
import { notification } from 'antd';
import classnames from 'classnames';
import 'react-virtualized/styles.css';
import { actions } from './store';

import styles from './index.less';

const cache = new CellMeasurerCache({
  defaultHeight: 100,
  minHeight: 75,
  fixedWidth: true,
});

const entityStore = new window.Map();
const measurerCacheStore = new window.Map();

class FeedList extends PureComponent {
  static defaultProps = {
    feedId: undefined,
    stream: Map(),
    pageSize: 10,
    onLoadStream() {},
    loadStream() {},
  }
  static propTypes = {
    feedId: PropTypes.string,
    stream: PropTypes.instanceOf(Map),
    pageSize: PropTypes.number,
    onLoadStream: PropTypes.func,
    loadStream: PropTypes.func,
  }
  state = {
    scrollToRow: 0,
  }
  componentDidUpdate(prevProps) {
    if (prevProps.feedId !== this.props.feedId) {
      cache.clearAll();
      this.list.scrollToPosition(0);
      this.list.recomputeRowHeights();
      measurerCacheStore.set(this.props.feedId, new window.Map());
      this.setState({
        scrollToRow: 0,
      });
    }
  }
  onScrollToChange = ({ scrollToRow }) => {
    this.setState({
      scrollToRow,
    });
  }
  loadMore = ({ startIndex, stopIndex }) => {
    const { feedId, pageSize, stream, onLoadStream, loadStream } = this.props;
    const pending = stream.get('pending');
    if (pending) return false;
    // const items = entityStore.get(feedId) || [];
    // console.log('loadMore', startIndex, stopIndex, items, items[startIndex], items[stopIndex]);
    // const updated = stream.get('updated');
    const continuation = stream.get('continuation');
    const loadOptions = {
      count: pageSize,
    };
    // if (items[startIndex]) {
    //   Object.assign(loadOptions, {

    //   });
    // }
    if (continuation) {
      Object.assign(loadOptions, {
        continuation,
      });
    }
    onLoadStream(feedId);
    return new Promise((resolve, reject) => {
      loadStream(feedId, loadOptions)
        .then(({ payload, error }) => {
          if (error) {
            notification.error({
              message: '加载失败',
              description: error,
            });
            reject(error);
          } else {
            if (entityStore.has(feedId)) {
              const oldItems = entityStore.get(feedId);
              entityStore.set(feedId, oldItems.concat(payload.items));
            } else {
              entityStore.set(feedId, payload.items);
            }
          }
        }).catch(error => {
          reject(error);
        });
    });
  }
  isRowLoaded = ({ index }) => {
    const items = entityStore.get(this.props.feedId) || [];
    return !!items[index];
  }
  noRowsRenderer = () => {
    return <div>empty</div>;
  }
  renderEntry = row => {
    const { feedId } = this.props;
    const { scrollToRow } = this.state;
    const data = entityStore.get(feedId) || [];
    const item = data[row.index];
    if (!row.isVisible) return null;
    let entry;
    if (item) {
      if (!measurerCacheStore.get(feedId).has(row.index)) {
        measurerCacheStore.get(feedId).set(row.index, true);
        cache.clear(row.index, 0);
      }
      entry = (
        <section
          className={classnames(styles.FeedList__Card, {
            [styles['FeedList__Card--active']]: row.index === scrollToRow,
          })}
          style={row.style}
          // disable-eslint-nextline
          onClick={() => {
            this.setState({
              scrollToRow: row.index,
            });
          }}
        >
          <p className={styles['FeedList__Card--title']}>{item.title}</p>
          <article
            className={styles['FeedList__Article']}
            dangerouslySetInnerHTML={{ __html: item.summary.content }}
          />
        </section>
      );
    } else {
      entry = (
        <section
          className={styles.FeedList__Card}
          style={row.style}
        >
          <ContentLoader
            className={styles.FeedList__Placeholder}
            speed={2}
            width={200}
            height={25}
            primaryColor="#f3f3f3"
            secondaryColor="#ecebeb"
            preserveAspectRatio={'xMidYMin meet'}
          >
            <rect x="2" y="2" rx="2" ry="2" width="48" height="4" />
            <rect x="2" y="8" rx="2" ry="2" width="190" height="16" />
          </ContentLoader>
        </section>
      );
    }
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={row.key}
        rowIndex={row.index}
        parent={row.parent}
      >
        {() => entry}
      </CellMeasurer>
    );
  }
  render() {
    const { feedId, pageSize, stream } = this.props;
    const { scrollToRow } = this.state;
    let rowCount;
    if (!feedId) {
      rowCount = 0;
    } else {
      if (stream.size === 0) {
        rowCount = pageSize;
      } else {
        const itemIds = stream.get('itemIds', Set());
        rowCount = stream.get('continuation') ? itemIds.size + pageSize : itemIds.size;
      }
    }
    return (
      <div className={styles.FeedList__Container}>
        <InfiniteLoader
          isRowLoaded={this.isRowLoaded}
          loadMoreRows={this.loadMore}
          rowCount={rowCount}
        >
          {({ onRowsRendered, registerChild }) => (
            <AutoSizer>
              {({ width, height }) => (
                <ArrowKeyStepper
                  columnCount={1}
                  rowCount={rowCount}
                  mode={'cells'}
                  isControlled
                  onScrollToChange={this.onScrollToChange}
                  scrollToRow={scrollToRow}
                >
                  {({ onSectionRendered, scrollToRow }) => (
                    <List
                      className={styles.FeedList__List}
                      ref={node => {
                        this.list = node;
                        registerChild(node);
                      }}
                      width={width}
                      height={height}
                      onSectionRendered={onSectionRendered}
                      scrollToIndex={scrollToRow}
                      deferredMeasurementCache={cache}
                      onRowsRendered={onRowsRendered}
                      noRowsRenderer={this.noRowsRenderer}
                      rowHeight={cache.rowHeight}
                      rowRenderer={this.renderEntry}
                      rowCount={rowCount}
                    />
                  )}
                </ArrowKeyStepper>
              )}
            </AutoSizer>
          )}
        </InfiniteLoader>
      </div>
    );
  }
}

const readerSelector = state => state['page.reader'];
const mapStateToProps = state => createSelector(
  readerSelector,
  pageState => ({}),
);
const mapDispatchToProps = dispatch => ({
  onLoadStream: id => dispatch(actions.onLoadStream(id)),
  loadStream: (id, options) => dispatch(actions.loadStream(id, options)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FeedList);
