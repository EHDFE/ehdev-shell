import { PureComponent } from 'react';
import { Map, Seq } from 'immutable';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import filesize from 'filesize';
import { Button, Dropdown, Icon, Menu, Tag } from 'antd';
import Slider from 'react-slick';
import UploadZone from '../../components/component.uploadZone/';
import { PROCESSED } from './store';
import Media from './Media';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import styles from './index.less';

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
    showLayer: false,
  };
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
    const rect = this.previewFigure.getBoundingClientRect();
    this.setState({
      indicatorLeft: e.clientX - rect.left,
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
      <div className={styles.ImageProcess__PreviewAction}>
        {actions}
      </div>
    );
  }
  renderController() {
    const { data, current, insertImage } = this.props;
    const sliderProps = {
      className: classnames('slider', 'variable-width', styles['ImageProcess__PreviewCtrl--list']),
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
      <div className={styles.ImageProcess__PreviewCtrl}>
        <Slider {...sliderProps}>
          {
            data.map((map, id) => (
              <figure
                key={id}
                className={classnames(
                  styles['ImageProcess__PreviewCtrl--item'],
                  {
                    [styles['ImageProcess__PreviewCtrl--active']]: id === current,
                  },
                )}
              >
                <Media data={map.get('originalImage')} />
                { (map.get('status') === PROCESSED) && <Icon type="check-circle" /> }
              </figure>
            )).valueSeq().toArray()
          }
        </Slider>
        <UploadZone
          className={styles['ImageProcess__PreviewCtrl--insert']}
          height={62}
          onChange={insertImage}
          multiple
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
      <div className={classnames(styles.ImageProcess__PreviewInfo, {
        [styles['ImageProcess__PreviewInfo--slideDown']]: showLayer,
      })}>
        <button
          className={styles.ImageProcess__PreviewInfoTrigger}
          onClick={this.handleToggleInfoLayer}
        >
          <Icon type={showLayer ? 'up' : 'down'} />
        </button>
        <ul className={styles['ImageProcess__PreviewInfo--list']}>
          <li className={styles['ImageProcess__PreviewInfo--item']}>
            <b>文件名</b>
            <span>{originalImage.get('name')}</span>
          </li>
          {
            width && (
              <li className={styles['ImageProcess__PreviewInfo--item']}>
                <b>尺寸</b>
                <span>{width} x {height}</span>
              </li>
            )
          }
          <li className={styles['ImageProcess__PreviewInfo--item']}>
            <b>大小</b>
            <span>{filesize(originalImage.get('size', 0), { base: 10 })}</span>
          </li>
        </ul>
      </div>
    );
  }
  renderProcessedPreview(processedImage, visible) {
    return (
      <Media
        data={processedImage}
        className={classnames(
          styles.ImageProcess__PreviewImage,
          styles['ImageProcess__PreviewImage--processed'],
          {
            [styles['ImageProcess__PreviewImage--hide']]: !visible,
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
          styles.ImageProcess__PreviewImage,
          styles['ImageProcess__PreviewImage--original'],
        )}
      />
    );
  }
  render() {
    const { indicatorLeft } = this.state;
    const { data, current } = this.props;
    const originalImage = data.getIn([current, 'originalImage']);
    const processedImage = data.getIn([current, 'processedImage']);
    const url = processedImage.get('url');
    const hasPreview = !!url;
    const SSIM = processedImage.get('SSIM');
    const originalImageStyle = {
    };
    if (hasPreview) {
      Object.assign(originalImageStyle, {
        clipPath: `inset(0 calc(100% - ${indicatorLeft}px) 0 0)`,
      });
    }
    return (
      <div className={styles.ImageProcess__Preview}>
        { this.renderController() }
        { this.renderInfoLayer(originalImage, processedImage) }
        <figure
          ref={node => this.previewFigure = node}
          className={styles.ImageProcess__PreviewWrap}
          onMouseEnter={this.showIndicator}
          onMouseLeave={this.hideIndicator}
          onMouseMove={this.moveIndicator}
        >
          { this.renderProcessedPreview(processedImage, hasPreview) }
          { this.renderOriginalPreview(originalImage, originalImageStyle) }
          <span
            style={{ left: `${indicatorLeft}px` }}
            className={
              classnames(
                styles.ImageProcess__PreviewIndicator,
                {
                  [styles['ImageProcess__PreviewIndicator--hide']]: !hasPreview,
                }
              )
            }
          />
          <Tag
            className={classnames(
              styles.ImageProcess__PreviewLabel,
              styles['ImageProcess__PreviewLabel--original'],
            )}
            color="red"
          >
            处理前: {filesize(originalImage.get('size', 0), { base: 10 })}
          </Tag>
          <Tag
            className={classnames(
              styles.ImageProcess__PreviewLabel,
              styles['ImageProcess__PreviewLabel--processed'],
              {
                [styles['ImageProcess__PreviewLabel--hide']]: !hasPreview,
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
                  styles.ImageProcess__PreviewLabel,
                  styles['ImageProcess__PreviewLabel--score'],
                )}
                color="blue"
              >
                {SSIM}
              </Tag>
            )
          }

        </figure>
        { this.renderButtons(url) }
      </div>
    );
  }
}
