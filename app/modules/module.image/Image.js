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
import Page from '../../components/component.page/';
import UploadZone from '../../components/component.uploadZone/';
import ListView from '../../components/component.infoListView/';
import PicOptions from '../../components/component.picOptions/';

import styles from './index.less';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

class ImageModule extends Component {
  static propTypes = {
    listType: PropTypes.oneOf(['grid', 'list']),
    fileList: PropTypes.array.isRequired,
    fetchFileList: PropTypes.func,
    setListType: PropTypes.func,
    upload: PropTypes.func,
    addFile: PropTypes.func,
    delFile: PropTypes.func,
    clearFile: PropTypes.func,
    generate: PropTypes.object,
    gUpConfig: PropTypes.func,
    gUpList: PropTypes.func,
    doGenerate: PropTypes.func,
  }
  handleChangeListType = e => {
    this.props.setListType(e.target.value);
  };
  handleFilesChange = files => {
    this.props.clearFile();
    for (const file of files) {
      const fileObj = {
        type: file.type,
        name: file.name,
        lastModified: file.lastModified,
        file
      };
      if (file.type.startsWith('image/')) {
        const fd = new FileReader();
        fd.onload = e => {
          Object.assign(fileObj, {
            url: e.target.result
          });
          this.props.addFile(fileObj);
        };
        fd.readAsDataURL(file);
      } else {
        this.props.addFile(fileObj);
      }
    }
  };
  handleGenConfig = (obj) => {
    const { gUpConfig } = this.props;
    gUpConfig(obj);
  };
  renderListView() {
    const { fileList, listType, delFile } = this.props;

    return (
      <ListView
        data={fileList}
        viewMode={listType}
        onDelete={delFile}
      />
    );
  }
  render() {
    const { listType } = this.props;
    return (
      <Page>
        <Row>
          <Col span={24}>
            <UploadZone onChange={this.handleFilesChange} />
          </Col>
        </Row>
        <Row>
          <PicOptions genParams={this.props} onChange={this.handleGenConfig} />
        </Row>
        <Row>
          <Col span={24} className={styles.ImageModule__controllerBar}>
            <div className={styles.ImageModule__viewMode}>
              <RadioGroup
                size='small'
                value={listType}
                onChange={this.handleChangeListType}>
                <RadioButton value='grid'>
                  <MdViewModule
                    size={18}
                    style={{ transform: 'translateY(-1px)' }} />
                </RadioButton>
                <RadioButton value='list'>
                  <MdViewHeadline size={18} style={{ transform: 'translateY(-1px)' }} />
                </RadioButton>
              </RadioGroup>
            </div>
          </Col>
        </Row>
        {this.renderListView()}
      </Page>
    );
  }
}

const processPageSelector = state => state['page.image'];
const listTypeSelector = createSelector(
  processPageSelector,
  pageState => pageState.layout.listType,
);
const fileListSelector = createSelector(
  processPageSelector,
  pageState => Object.keys(pageState.files.fileMap).map(id => pageState.files.fileMap[id]),
);
const generateConfigSelector = createSelector(
  processPageSelector,
  pageState => pageState.generate.gConfig,
);
const generateListSelector = createSelector(
  processPageSelector,
  pageState => pageState.generate.gOverList
);

const mapStateToProps = (state, ownProps) => createSelector(
  listTypeSelector,
  fileListSelector,
  generateConfigSelector,
  generateListSelector,
  (listType, fileList, gConfig, gOverList) => ({
    listType,
    fileList,
    gConfig,
    gOverList,
  })
)(state);

const mapDispatchToProps = (dispatch, ownProps) => ({
  setListType: type => dispatch(actions.genlayout.setListType(type)),
  fetchFileList: params => dispatch(actions.genlist.get(params)),
  addFile: file => dispatch(actions.genfiles.add(file)),
  delFile: id => dispatch(actions.genfiles.del(id)),
  clearFile: () => dispatch(actions.genfiles.clear()),
  upload: (id, file) => dispatch(actions.genfiles.upload(id, file)),
  gUpConfig: c => dispatch(actions.generate.upConfig(c)),
  gUpList: l => dispatch(actions.generate.upList(l)),
  doGenerate: (files, config) => dispatch(actions.genfiles.doGen(files, config))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImageModule);
