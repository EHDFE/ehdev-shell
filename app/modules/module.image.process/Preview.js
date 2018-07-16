import { PureComponent, Fragment, createRef } from 'react';
import { Map, Seq } from 'immutable';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import filesize from 'filesize';
import { Button, Dropdown, Icon, Menu, Tag } from 'antd';
import Slider from 'react-slick';
import ZoomIn from 'react-icons/lib/md/zoom-in';
import ZoomOut from 'react-icons/lib/md/zoom-out';
import UploadZone from '../../components/component.uploadZone/';
import { PROCESSED } from './store';
import Media from './Media';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import styles from './preview.less';

export default class Preview extends PureComponent {
  static propTypes = {
    data: PropTypes.instanceOf(Map),
    list: PropTypes.instanceOf(Seq.Indexed),
    processing: PropTypes.bool,
    current: PropTypes.string,
    onRemove: PropTypes.func.isRequired,
    onStart: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onOpenBatchProcess: PropTypes.func.isRequired,
    onBatchDownload: PropTypes.func.isRequired,
    insertImage: PropTypes.func.isRequired,
  };
  state = {
    indicatorLeft: 0,
    indicatorVisible: false,
    clipLeft: 0,
    showLayer: false,
    zoom: 1,
  };
  constructor(props) {
    super(props);
    this.originalMedia = createRef();
    this.previewNode = createRef();
  }
  showIndicator = () => {
    this.setState({
      indicatorVisible: true,
    });
  }
  hideIndicator = () => {
    this.setState({
      indicatorVisible: false,
    });
  }
  moveIndicator = e => {
    const rect = this.previewNode.current.getBoundingClientRect();
    const mediaRect = this.originalMedia.getBoundingClientRect();
    this.setState({
      indicatorLeft: e.clientX - rect.left,
      clipLeft: e.clientX - mediaRect.left,
    });
  }
  handleSaveFile() {
    const { data, current } = this.props;
    const originalImage = data.getIn([current, 'originalImage']);
    const processedImage = data.getIn([current, 'processedImage']);
    const url = processedImage.get('url');
    if (!url) return false;
    const node = document.createElement('a');
    const originalFileName = originalImage.get('name');
    const downloadFileName = `${originalFileName.replace(/\.[^.]*$/, '')}.optimized.${processedImage.get('ext')}`;
    node.setAttribute('href', url);
    node.setAttribute('download', downloadFileName);
    node.click();
  }
  handleSlideChange = current => {
    const { list, onChange } = this.props;
    onChange(list.get(current));
  }
  handleToggleInfoLayer = () => {
    this.setState(state => ({
      showLayer: !state.showLayer,
    }));
  }
  handleAction = ({ target }) => {
    const key = target.dataset.key;
    if (key === 'download') {
      this.handleSaveFile();
    } else if (key === 'delete') {
      this.props.onRemove(this.props.current);
    } else {
      this.props.onStart();
    }
  }
  handleBatchAction = ({ key }) => {
    if (key === 'download') {
      this.props.onBatchDownload();
    } else if (key === 'delete') {
      this.props.onRemove(this.props.data.keySeq().toArray());
    } else {
      this.props.onOpenBatchProcess();
    }
  }
  handleZoomIn = () => {
    this.setState(state => {
      return {
        zoom: state.zoom * 2,
      };
    });
  }
  handleZoomOut = () => {
    this.setState(state => {
      return {
        zoom: state.zoom / 2,
      };
    });
  }
  renderButtons(url) {
    const { data, processing } = this.props;
    let actions = [];
    let actionGroup = (
      <Button.Group key={'action'}>
        <Button loading={processing} onClick={this.handleAction} data-key={'process'}>处理</Button>
        <Button loading={processing} onClick={this.handleAction} data-key={'download'}>保存</Button>
        <Button loading={processing} onClick={this.handleAction} data-key={'delete'}>删除</Button>
      </Button.Group>
    );
    actions.push(actionGroup);

    const batchMenu = (
      <Menu onClick={this.handleBatchAction}>
        <Menu.Item key={'download'}>全部保存</Menu.Item>
        <Menu.Item key={'delete'}>全部删除</Menu.Item>
      </Menu>
    );

    if (data.size > 1) {
      const batchAction = (
        <Dropdown.Button
          key={'batchAction'}
          onClick={this.handleBatchAction}
          overlay={batchMenu}
        >
          批量处理
        </Dropdown.Button>
      );
      actions.push(batchAction);
    }

    return (
      <div className={styles.Preview__Action}>
        {actions}
      </div>
    );
  }
  renderController() {
    const { data, current, insertImage } = this.props;
    const sliderProps = {
      className: classnames('slider', 'variable-width', styles['Preview__CtrlList']),
      arrows: false,
      slidesToShow: 1,
      slidesToScroll: 1,
      variableWidth: true,
      infinite: false,
      focusOnSelect: true,
      centerMode: data.size > 1,
      afterChange: this.handleSlideChange,
    };
    return (
      <div className={styles.Preview__Ctrl}>
        <Slider {...sliderProps}>
          {
            data.map((map, id) => (
              <figure
                key={id}
                className={classnames(
                  styles['Preview__CtrlItem'],
                  {
                    [styles['Preview__CtrlItem--active']]: id === current,
                  },
                )}
              >
                <Media data={map.get('originalImage')} useThumb />
                { (map.get('status') === PROCESSED) && <Icon type="check-circle" /> }
              </figure>
            )).valueSeq().toArray()
          }
        </Slider>
        <UploadZone
          className={styles['Preview__CtrlInsert']}
          height={62}
          onChange={insertImage}
          multiple
          accept={['image', 'video']}
          content={<Icon type="plus" />}
        />
      </div>
    );
  }
  renderInfoLayer(originalImage, processedImage) {
    const width = originalImage.getIn(['dimensions', 'width']);
    const height = originalImage.getIn(['dimensions', 'height']);
    const { showLayer } = this.state;
    return (
      <div className={classnames(styles.Preview__Info, {
        [styles['Preview__Info--slideDown']]: showLayer,
      })}>
        <button
          className={styles.Preview__InfoTrigger}
          onClick={this.handleToggleInfoLayer}
        >
          <Icon type={showLayer ? 'up' : 'down'} />
        </button>
        <ul className={styles['Preview__InfoList']}>
          <li className={styles['Preview__InfoItem']}>
            <b>文件名</b>
            <span>{originalImage.get('name')}</span>
          </li>
          {
            width && (
              <li className={styles['Preview__InfoItem']}>
                <b>尺寸</b>
                <span>{width} x {height}</span>
              </li>
            )
          }
          <li className={styles['Preview__InfoItem']}>
            <b>大小</b>
            <span>{filesize(originalImage.get('size', 0), { base: 10 })}</span>
          </li>
        </ul>
      </div>
    );
  }
  renderProcessedPreview(processedImage, visible, style) {
    return (
      <Media
        style={style}
        data={processedImage}
        className={classnames(
          styles.Preview__Image,
          styles['Preview__Image--processed'],
          {
            [styles['Preview__Image--hide']]: !visible,
          }
        )}
      />
    );
  }
  renderOriginalPreview(originalImage, style) {
    return (
      <Media
        data={originalImage}
        style={style}
        className={classnames(
          styles.Preview__Image,
          styles['Preview__Image--original'],
        )}
        mediaRef={el => this.originalMedia = el}
      />
    );
  }
  renderZoomControl() {
    return (
      <Fragment>
        <button
          className={classnames(
            styles.Preview__ZoomCtrl,
            styles['Preview__ZoomCtrl--in'],
          )}
          onClick={this.handleZoomIn}
        >
          <ZoomIn size={22} />
        </button>
        <button
          className={classnames(
            styles.Preview__ZoomCtrl,
            styles['Preview__ZoomCtrl--out'],
          )}
          onClick={this.handleZoomOut}
        >
          <ZoomOut size={22} />
        </button>
      </Fragment>
    );
  }
  renderLabels(processedImage, originalImage) {
    const SSIM = processedImage.get('SSIM');
    return (
      <Fragment>
        <Tag
          className={classnames(
            styles.Preview__Label,
            styles['Preview__Label--original'],
          )}
          color="red"
        >
          处理前: {filesize(originalImage.get('size', 0), { base: 10 })}
        </Tag>
        <Tag
          className={classnames(
            styles.Preview__Label,
            styles['Preview__Label--processed'],
            {
              [styles['Preview__Label--hide']]: !processedImage.get('url'),
            },
          )}
          color="green"
        >
          处理后: {filesize(processedImage.get('size', 0), { base: 10 })}
        </Tag>
        {
          SSIM && (
            <Tag
              className={classnames(
                styles.Preview__Label,
                styles['Preview__Label--score'],
              )}
              color="blue"
            >
              {SSIM}
            </Tag>
          )
        }
      </Fragment>
    );
  }
  render() {
    const { indicatorLeft, clipLeft, zoom } = this.state;
    const { data, current } = this.props;
    const originalImage = data.getIn([current, 'originalImage']);
    const processedImage = data.getIn([current, 'processedImage']);
    const url = processedImage.get('url');
    const hasPreview = !!url;
    const zoomStyle = {
      width: `${zoom * 100}%`,
      height: `${zoom * 100}%`,
    };
    const originalImageStyle = Object.assign({}, zoomStyle);
    if (hasPreview) {
      Object.assign(originalImageStyle, {
        clipPath: `inset(0 calc(100% - ${clipLeft}px) 0 0)`,
      });
    }

    return (
      <div className={styles.Preview__Container}>
        { this.renderController() }
        { this.renderInfoLayer(originalImage, processedImage) }
        <figure
          ref={this.previewNode}
          className={styles.Preview__Figure}
          onMouseEnter={this.showIndicator}
          onMouseLeave={this.hideIndicator}
          onMouseMove={this.moveIndicator}
        >
          { this.renderProcessedPreview(processedImage, hasPreview, zoomStyle) }
          { this.renderOriginalPreview(originalImage, originalImageStyle) }
          { this.renderZoomControl() }
          <span
            style={{ left: `${indicatorLeft}px` }}
            className={
              classnames(
                styles.Preview__Indicator,
                {
                  [styles['Preview__Indicator--hide']]: !hasPreview,
                }
              )
            }
          />
          { this.renderLabels(processedImage, originalImage) }
        </figure>
        { this.renderButtons(url) }
      </div>
    );
  }
}
