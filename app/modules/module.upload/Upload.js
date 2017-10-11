/**
 * Upload Page
 * @author ryan.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Row, Col, Radio } from 'antd';
import MdViewHeadline from 'react-icons/lib/md/view-headline';
import MdViewModule from 'react-icons/lib/md/view-module';

import { actions } from './store';
import UploadZone from '../../components/component.uploadZone/';
import ListView from '../../components/component.listView/';

import styles from './index.less';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

class UploadModule extends Component {
  static propTypes = {
    listType: PropTypes.oneOf(['grid', 'list']),
    fileList: PropTypes.array.isRequired,
  }
  componentWillMount() {
    const { fetchFileList } = this.props;
    fetchFileList();
  }
  handleChangeListType = e => {
    this.props.setListType(e.target.value);
  }
  handleFilesChange = files => {
    for (const file of files) {
      const fileObj = {
        type: file.type,
        name: file.name,
        lastModified: file.lastModified,
        file,
      };
      if (file.type.startsWith('image/')) {
        const fd = new FileReader();
        fd.onload = e => {
          Object.assign(fileObj, {
            url: e.target.result,
          });
          this.props.addFile(fileObj);
        };
        fd.readAsDataURL(file);
      } else {
        this.props.addFile(fileObj);
      }
    }
  }
  renderListView() {
    const {
      fileList,
      listType,
      upload,
      delFile
    } = this.props;
    return (
      <ListView
        data={fileList}
        viewMode={listType}
        onUpload={upload}
        onDelete={delFile}
      />
    );
  }
  render() {
    const { listType } = this.props;
    console.log(this.props);
    return (
      <div>
        <Row>
          <Col span={24}>
            <UploadZone onChange={this.handleFilesChange} />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className={styles.UploadModule__viewMode}>
              <RadioGroup
                size="small"
                value={listType}
                onChange={this.handleChangeListType}
              >
                <RadioButton value="grid">
                  <MdViewModule size={18} />
                </RadioButton>
                <RadioButton value="list">
                  <MdViewHeadline size={18} />
                </RadioButton>
              </RadioGroup>
            </div>
          </Col>
        </Row>
        { this.renderListView() }
      </div>
    );
  }
}

const uploadPageSelector = state => state['page.upload'];
const listTypeSelector = createSelector(
  uploadPageSelector,
  pageState => pageState.layout.listType,
)
const fileListSelector = createSelector(
  uploadPageSelector,
  pageState => Object.keys(pageState.files.fileMap).map(id => pageState.files.fileMap[id]),
);

const mapStateToProps = (state, ownProps) => createSelector(
  listTypeSelector,
  fileListSelector,
  (listType, fileList, pageData) => ({
    listType,
    fileList,
  })
)(state);

const mapDispatchToProps = (dispatch, ownProps) => ({
  setListType: type => dispatch(actions.layout.setListType(type)),
  fetchFileList: params => dispatch(actions.list.get(params)),
  addFile: file => dispatch(actions.files.add(file)),
  delFile: id => dispatch(actions.files.del(id)),
  batchAddFile: file => dispatch(actions.files.batchAdd(file)),
  batchDelFile: ids => dispatch(actions.files.batchDel(ids)),
  upload: (id, file) => dispatch(actions.files.upload(id, file)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UploadModule);
