/**
 * Upload Page
 * @author ryan.bian
 */
import { Col, Radio, Row } from 'antd';
import { Map } from 'immutable';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import MdViewHeadline from 'react-icons/lib/md/view-headline';
import MdViewModule from 'react-icons/lib/md/view-module';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import ListView from '../../components/component.listView/';
import UploadZone from '../../components/component.uploadZone/';
import styles from './index.less';
import { actions } from './store';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

class UploadModule extends PureComponent {
  static propTypes = {
    listType: PropTypes.oneOf(['grid', 'list']),
    fileList: PropTypes.instanceOf(Map).isRequired,
    fetchFileList: PropTypes.func,
    setListType: PropTypes.func,
    upload: PropTypes.func,
    addFile: PropTypes.func,
    delFile: PropTypes.func,
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
    return (
      <div>
        <Row>
          <Col span={24}>
            <UploadZone
              onChange={this.handleFilesChange}
              accept={''}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24} className={styles.UploadModule__controllerBar}>
            <div className={styles.UploadModule__viewMode}>
              <RadioGroup
                size="small"
                value={listType}
                onChange={this.handleChangeListType}
              >
                <RadioButton value="grid">
                  <MdViewModule size={18} style={{
                    transform: 'translateY(-1px)',
                  }} />
                </RadioButton>
                <RadioButton value="list">
                  <MdViewHeadline size={18} style={{
                    transform: 'translateY(-1px)',
                  }} />
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
  pageState => pageState.getIn(['layout', 'listType']),
);
const fileListSelector = createSelector(
  uploadPageSelector,
  pageState => pageState
    .getIn(['files', 'fileMap'])
    .sortBy(d => d.lastModified, (a, b) => {
      if (a < b) return 1;
      if (a > b) return -1;
      if (a === b) return 0;
    }),
);

const mapStateToProps = (state, ownProps) => createSelector(
  listTypeSelector,
  fileListSelector,
  (listType, fileList) => ({
    listType,
    fileList,
  })
)(state);

let dispatched = false;

const mapDispatchToProps = (dispatch, ownProps) => {
  if (!dispatched) {
    dispatch(actions.list.get());
    dispatched = true;
  }
  return {
    setListType: type => dispatch(actions.layout.setListType(type)),
    fetchFileList: () => dispatch(actions.list.get()),
    addFile: file => dispatch(actions.files.add(file)),
    delFile: id => dispatch(actions.files.del(id)),
    batchAddFile: file => dispatch(actions.files.batchAdd(file)),
    batchDelFile: ids => dispatch(actions.files.batchDel(ids)),
    upload: (id, file) => dispatch(actions.files.upload(id, file)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UploadModule);
