/**
 * List Component
 * @author ryan.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import classnames from 'classnames';
import { Row, Col, Modal, notification } from 'antd';
import MdFileUpload from 'react-icons/lib/md/file-upload';
import MdRemoveRedEye from 'react-icons/lib/md/remove-red-eye';
import MdDelete from 'react-icons/lib/md/delete';
import MdContentCopy from 'react-icons/lib/md/content-copy';
import CopyToClipboard from 'react-copy-to-clipboard';
import moment from 'moment';

import FileCard from '../component.fileCard/';

import CONFIG from '../../suite/CONFIG';

import styles from './index.less';

export default class ListView extends Component {
  static defaultProps = {
    viewMode: 'grid',
    data: [],
    onUpload() {},
    onDelete() {},
  }
  static propTypes = {
    viewMode: PropTypes.oneOf([
      'grid',
      'list',
    ]),
    data: PropTypes.array,
    onUpload: PropTypes.func,
    onDelete: PropTypes.func,
  }
  state = {
    previewModalVisible: false,
    previewDataId: null,
  }
  /**
   * upload file
   */
  handleUpload = e => {
    const { data } = this.props;
    const id = e.currentTarget.dataset.id;
    const handleItem = data.find(d => d._id === id);
    this.props.onUpload(id, handleItem);
  }
  /**
   * preview the file
   */
  handlePreview = e => {
    const id = e.currentTarget.dataset.id;
    this.setState({
      previewDataId: id,
      previewModalVisible: true,
    });
  }
  /**
   * delete the file
   */
  handleDelete = e => {
    const id = e.currentTarget.dataset.id;
    this.props.onDelete(id);
  }
  /**
   * after copy url
   * show notification
   */
  afterCopy() {
    notification.success({
      message: '复制成功！',
    });
  }
  renderItemActions(item, asMask) {
    const IconProps = {
    };
    if (asMask) {
      Object.assign(IconProps, {
        size: 24,
        style: {
          color: '#fff',
        },
      });
    } else {
      Object.assign(IconProps, {
        size: 18
      });
    }
    const actionButtons = [];
    if (item.temp) {
      actionButtons.push(
        <button
          key={`${item._id}_upload`}
          data-id={item._id}
          onClick={this.handleUpload}
        >
          <MdFileUpload {...IconProps} />
        </button>
      );
    } else {
      actionButtons.push(
        <CopyToClipboard
          key={`${item._id}_copy`}
          text={item.url}
          onCopy={this.afterCopy}
        >
          <button onClick={this.handleCopyUrl}>
            <MdContentCopy {...IconProps} />
          </button>
        </CopyToClipboard>
      );
    }
    if (item.type.startsWith('image/')) {
      actionButtons.push(
        <button
          key={`${item._id}_preview`}
          data-id={item._id}
          onClick={this.handlePreview}
        >
          <MdRemoveRedEye {...IconProps} />
        </button>
      );
    }
    actionButtons.push(
      <button
        key={`${item._id}_delete`}
        data-id={item._id}
        onClick={this.handleDelete}
      >
        <MdDelete {...IconProps} />
      </button>
    );
    return actionButtons;
  }
  renderGridView(data) {
    return (
      <Row type="flex">
        {
          data.map(d =>
            <Col xs={12} sm={8} lg={6} xl={4} xll={3} key={d._id}>
              <FileCard
                url={d.url}
                name={d.name}
                type={d.type}
                mask={this.renderItemActions(d, true)}
              />
            </Col>
          )
        }
      </Row>
    );
  }
  renderListView(data) {
    return (
      <div className={styles.ListView__list}>
        {
          data.map(d =>
            <div className={styles.ListView__listItem} key={d._id}>
              <div>
                <p className={styles.ListView__listName}>{ d.name }</p>
                <p className={styles.ListView__listTime}>{ moment(d.lastModified).format('YYYY-MM-DD HH:mm') }</p>
              </div>
              <div className={styles.ListView__listItemAction}>
                {
                  this.renderItemActions(d)
                }
              </div>
            </div>
          )
        }
      </div>
    );
  }
  renderImagePreview() {
    const { data } = this.props;
    const { previewModalVisible, previewDataId } = this.state;
    const previewItem = data.find(d => d._id === previewDataId);
    const modalProps = {
      width: CONFIG.WIDTH - 130,
      visible: previewModalVisible,
      closable: false,
      onCancel: () => {
        this.setState({
          previewModalVisible: false,
        });
      },
      footer: null
    };
    return (
      <Modal {...modalProps}>
        <div className={styles.ListView__imagePreview}>
          <img alt="" src={previewItem && previewItem.url} />
        </div>
      </Modal>
    );
  }
  render() {
    const { viewMode, data } = this.props;
    return (
      <div>
        {
          viewMode === 'grid' ? this.renderGridView(data) : this.renderListView(data)
        }
        {
          this.renderImagePreview()
        }
      </div>
    );
  }
}
