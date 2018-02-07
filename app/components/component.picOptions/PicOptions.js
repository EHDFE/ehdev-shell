/**
 * PicOptions Component
 * @author Hefan
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
// import classnames from 'classnames';
import { Radio, Switch, Slider, Row, Button, Input, Icon } from 'antd';
const { dialog } = require('electron').remote;

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

import styles from './index.less';

export default class PicOptions extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    genParams: PropTypes.object,
  }
  /**
   * 选择品质
   */
  onQualityChange = (value) => {
    this.props.onChange({
      quality: value
    });
  };
  /**
   * 选择输出格式
   */
  onFormatChange = (e) => {

    this.props.onChange({
      format: e.target.value
    });
  };
  /**
   * 选择生产webp
   */
  onToWebpChange = (checked) => {

    this.props.onChange({
      webp: checked
    });
  };
  /**
   * 执行生产
   */
  handleGenerate = () => {
    const { genParams } = this.props;
    const { doGenerate, fileList, gConfig } = genParams;

    doGenerate(fileList, Object.assign({}, gConfig));

  };
  /**
   * 输出路径
   */
  handleOutput = () => {
    const { genParams } = this.props;
    const { gConfig } = genParams;

    dialog.showOpenDialog(
      {
        //默认路径
        defaultPath: gConfig.output,
        //选择操作，此处是打开文件夹
        properties: ['openDirectory'],
        //过滤条件
        filters: [{ name: 'All', extensions: ['*'] }]
      },
      (res) => {
        //回调函数内容，此处是将路径内容显示在input框内
        if (!res) return;
        this.props.onChange({
          output: res[0]
        });
      }
    );
  }

  renderQuality() {
    const { genParams } = this.props;
    const { gConfig } = genParams;
    const marks = {
      10: '10%',
      50: '50%',
      100: '100%'
    };
    return (
      <Row className={styles.PicOptions__row}>
        <div className={styles.PicOptions__label}>图片品质:</div>
        <div className={styles.PicOptions__input}>
          <Slider
            min={10}
            marks={marks}
            step={5}
            value={gConfig.quality}
            onChange={this.onQualityChange} />
        </div>
      </Row>
    );
  }
  renderFormat() {
    const { genParams } = this.props;
    const { gConfig } = genParams;
    return (
      <Row className={styles.PicOptions__row}>
        <div className={styles.PicOptions__label}>导出格式:</div>
        <div className={styles.PicOptions__input}>
          <RadioGroup onChange={this.onFormatChange} value={gConfig.format} size='small'>
            <RadioButton value='jpg'>jpg</RadioButton>
            <RadioButton value='png'>png</RadioButton>
            <RadioButton value='webp'>webp</RadioButton>
            <RadioButton value=''>默认</RadioButton>
          </RadioGroup>
        </div>
      </Row>
    );
  }
  renderToWebp() {
    const { genParams } = this.props;
    const { gConfig } = genParams;
    return (
      <Row className={styles.PicOptions__row}>
        <div className={styles.PicOptions__label}>生产webP:</div>
        <div className={styles.PicOptions__input}>
          <Switch checked={gConfig.webp} onChange={this.onToWebpChange} />
        </div>
      </Row>
    );
  }

  renderGenBtn() {
    const { genParams } = this.props;
    const { fileList, gConfig } = genParams;

    if (fileList.length === 0 || gConfig.output === '') {
      return (
        <Button type='danger' ghost disabled>
            生成图片
        </Button>
      );
    } else {
      return (
        <Button type='danger' ghost onClick={this.handleGenerate}>
          生成图片
        </Button>
      );
    }
  }

  render() {
    const { genParams } = this.props;
    const { gConfig } = genParams;

    return (
      <div styles={styles.PicOptions}>
        {this.renderQuality()}
        {/* {this.renderFormat()} */}
        {this.renderToWebp()}
        <div className={styles.PicOptions__row}>
          <Input
            value={gConfig.output}
            onClick={this.handleOutput}
            placeholder='输出目录'
            prefix={<Icon type='folder-open' />}
          />
        </div>
        <div className={styles.PicOptions__row}>{this.renderGenBtn()}</div>
      </div>
    );
  }
}
