/**
 * PicOptions Component
 * @author Hefan
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
// import classnames from 'classnames';
import {
  Form,
  Switch,
  Slider,
  Row,
  Col,
  Button,
  Input,
  Icon,
  Tooltip,
  Checkbox,
  Divider,
  Select,
  InputNumber
} from 'antd';
const { dialog } = require('electron').remote;

const Option = Select.Option;

import styles from './index.less';

@Form.create()
class PicOptions extends Component {
  state = {
    expandFormat: false
  };
  static propTypes = {
    onChange: PropTypes.func,
    genParams: PropTypes.object,
    form: PropTypes.object,
  };

  handleSubmit = e => {
    const { genParams } = this.props;
    const { doGenerate, fileList, gConfig } = genParams;

    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const formObj = { ...values };
        for (let key in formObj) {
          if (values[key] === undefined) {
            delete formObj[key];
          }
        }
        this.props.onChange(formObj);
        
        doGenerate(fileList, Object.assign({}, gConfig, formObj));
      }
    });
  };
  handleReset = () => {
    this.props.form.resetFields();
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
      res => {
        //回调函数内容，此处是将路径内容显示在input框内
        if (!res) throw res;
        
        this.props.form.setFieldsValue({
          output: res[0]
        });
      }
    );
  };

  renderSimpleFormat() {
    const { getFieldDecorator } = this.props.form;
    const { genParams } = this.props;
    const { gConfig } = genParams;
    const marks = {
      10: '10%',
      50: '50%',
      100: '100%'
    };
    return (
      <Form onSubmit={this.handleSubmit}>
        <Row className={styles.PicOptions__row}>
          <div className={styles.PicOptions__label}>图片品质:</div>
          <div className={styles.PicOptions__input}>
            {getFieldDecorator('quality', {
              initialValue: gConfig.quality
            })(<Slider min={10} marks={marks} step={5} />)}
          </div>
        </Row>
        {this.renderAdvancedFormat()}
        {this.renderCommon()}
      </Form>
    );
  }
  renderAdvancedFormat() {
    const { getFieldDecorator } = this.props.form;

    const svgPlugin = [
      {
        key: 'cleanupAttrs',
        text: '从换行符清除属性，尾随和重复空格'
      },
      {
        key: 'removeDoctype',
        text: '删除doctype声明'
      },
      {
        key: 'removeXMLProcInst',
        text: '删除XML处理指令'
      },
      {
        key: 'removeComments',
        text: '删除评论'
      },
      {
        key: 'removeMetadata',
        text: '删除<metadata>'
      },
      {
        key: 'removeTitle',
        text: '删除<title>'
      },
      {
        key: 'removeDesc',
        text: '删除<desc>'
      },
      {
        key: 'removeUselessDefs',
        text: '删除没有id的<defs>元素'
      },
      {
        key: 'removeXMLNS',
        text: '删除xmlns属性（对于内联svg，默认禁用'
      },
      {
        key: 'removeEditorsNSData',
        text: '删除编辑器名称空间，元素和属性'
      },
      {
        key: 'removeEmptyAttrs',
        text: '删除空的属性'
      },
      {
        key: 'removeHiddenElems',
        text: '删除隐藏的元素'
      },
      {
        key: 'removeEmptyText',
        text: '删除空的文本元素'
      },
      {
        key: 'removeEmptyContainers',
        text: '删除空的容器元素'
      },
      {
        key: 'removeViewBox',
        text: '尽可能删除viewBox属性'
      },
      {
        key: 'cleanupEnableBackground',
        text: '在可能的情况下删除或清除enable-background属性'
      },
      {
        key: 'minifyStyles',
        text: '用CSSO缩小<style>元素的内容'
      },
      {
        key: 'convertStyleToAttrs',
        text: '将样式转换为属性'
      },
      {
        key: 'convertColors',
        text: '转换颜色(from rgb() to #rrggbb, from #rrggbb to #rgb)'
      },
      {
        key: 'convertPathData',
        text:
          '将路径数据转换为相对或绝对（以较短者为准），将一段转换为另一段，修剪无用的分隔符，智能舍入等等'
      },
      {
        key: 'convertTransform',
        text: '将多个转换合并为一个，将矩阵转换为简短的别名等等'
      },
      {
        key: 'removeUnknownsAndDefaults',
        text: '删除未知元素的内容和属性，删除具有默认值的attrs'
      },
      {
        key: 'removeNonInheritableGroupAttrs',
        text: '删除非可继承组的“演示”属性'
      },
      {
        key: 'removeUselessStrokeAndFill',
        text: '删除无用的笔触和填充ATTRS'
      },
      {
        key: 'removeUnusedNS',
        text: '删除未使用的命名空间声明'
      },
      {
        key: 'cleanupIDs',
        text: '删除未使用的和缩小使用的ID'
      },
      {
        key: 'cleanupNumericValues',
        text: '将数字值修改为固定精度，移除默认的px单位'
      },
      {
        key: 'cleanupListOfValues',
        text: '在带有数字列表的属性中的圆形数值（如viewBox或enable-background'
      },
      {
        key: 'moveElemsAttrsToGroup',
        text: '移动元素的属性到他们的封闭组'
      },
      {
        key: 'moveGroupAttrsToElems',
        text: '将一些组属性移动到包含的元素'
      },
      {
        key: 'collapseGroups',
        text: '摧毁无用的组'
      },
      {
        key: 'removeRasterImages',
        text: '删除光栅图像（默认禁用）'
      },
      {
        key: 'mergePaths',
        text: '将多个路径合并为一个'
      },
      {
        key: 'convertShapeToPath',
        text: '将一些基本形状转换为<path>'
      },
      {
        key: 'sortAttrs',
        text: '为元素可读性排序元素属性（默认情况下禁用）<path>'
      },
      {
        key: 'removeDimensions',
        text:
          '如果viewBox存在，则删除宽度/高度属性（与removeViewBox相反，先禁用它）（默认情况下禁用）'
      },
      {
        key: 'removeAttrs',
        text: '按模式删除属性（默认情况下禁用）'
      },
      {
        key: 'removeElementsByAttr',
        text: '通过ID或className删除任意元素（默认情况下禁用）'
      },
      {
        key: 'addClassesToSVGElement',
        text: '将classnames添加到外部<svg>元素（默认情况下禁用）'
      },
      {
        key: 'addAttributesToSVGElement',
        text: '将属性添加到外部<svg>元素（默认情况下禁用）'
      },
      {
        key: 'removeStyleElement',
        text: '删除<style>元素（默认禁用）'
      },
      {
        key: 'removeScriptElement',
        text: '删除<script>元素（默认情况下禁用）'
      }
    ];
    return (
      <div style={{ display: this.state.expandFormat ? 'block' : 'none' }}>
        <Divider dashed />
        <Row className={styles.PicOptions__row}>
          <div className={styles.PicOptions__label}>JPG高级:</div>
          <div className={styles.PicOptions__input}>
            <Col span={8}>
              <Tooltip placement="topLeft" title="禁用逐行扫描优化">
                {getFieldDecorator('jpg-fastCrush')(
                  <Checkbox>fastCrush</Checkbox>
                )}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip placement="topLeft" title="网格优化">
                {getFieldDecorator('jpg-trellis', {
                  valuePropName: 'checked',
                  initialValue: true
                })(<Checkbox>trellis</Checkbox>)}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip placement="topLeft" title="DC系数的网格优化">
                {getFieldDecorator('jpg-trellisDC', {
                  valuePropName: 'checked',
                  initialValue: true
                })(<Checkbox>trellisDC</Checkbox>)}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip
                placement="topLeft"
                title="使用8位量化表项作为基准JPEG兼容性">
                {getFieldDecorator('jpg-quantBaseline')(
                  <Checkbox>quantBaseline</Checkbox>
                )}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip placement="topLeft" title="使用算术编码">
                {getFieldDecorator('jpg-arithmetic')(
                  <Checkbox>arithmetic</Checkbox>
                )}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip placement="topLeft" title="通过过冲黑色的白色deringing">
                {getFieldDecorator('jpg-overshoot', {
                  valuePropName: 'checked',
                  initialValue: true
                })(<Checkbox>overshoot</Checkbox>)}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip
                placement="topLeft"
                title="设置DC扫描优化模式&nbsp;&nbsp;1、一次扫描所有组件&nbsp;&nbsp;2、每个组件扫描一次&nbsp;&nbsp;3、针对所有组件的一次扫描和针对第一个组件的扫描之间进行优化，针对其余组件进行一次扫描">
                {getFieldDecorator('jpg-dcScanOpt', {
                  initialValue: 1
                })(
                  <Select
                    placeholder="设置DC扫描优化模式"
                    style={{ width: 120 }}>
                    <Option value={0}>1</Option>
                    <Option value={1}>2</Option>
                    <Option value={2}>3</Option>
                  </Select>
                )}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip
                placement="topLeft"
                title="使用预定义的量化表&nbsp;&nbsp;1、JPEG附件K&nbsp;&nbsp;2、平面&nbsp;&nbsp;3、自定义，调整为MS-SSIM&nbsp;&nbsp;4、N. Robidoux的ImageMagick表&nbsp;&nbsp;5、自定义，调整为PSNR-HVS&nbsp;&nbsp;6、来自Klein，Silverstein和Carney的论文表">
                {getFieldDecorator('jpg-quantTable')(
                  <Select
                    placeholder="使用预定义的量化表"
                    style={{ width: 120 }}>
                    <Option value={0}>1</Option>
                    <Option value={1}>2</Option>
                    <Option value={2}>3</Option>
                    <Option value={3}>4</Option>
                    <Option value={4}>5</Option>
                    <Option value={5}>6</Option>
                  </Select>
                )}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip
                placement="topLeft"
                title="设置平滑抖动输入的强度。（1 ... 100）">
                {getFieldDecorator('jpg-smooth')(
                  <InputNumber min={1} max={100} step={1} />
                )}
              </Tooltip>
            </Col>
          </div>
        </Row>
        <Divider dashed />
        <Row className={styles.PicOptions__row}>
          <div className={styles.PicOptions__label}>PNG高级:</div>
          <div className={styles.PicOptions__input}>
            <Col span={8}>
              <Tooltip placement="topLeft" title="控制抖动水平（0 =无，1 =满）">
                {getFieldDecorator('png-floyd', {
                  initialValue: 0.5
                })(<InputNumber min={0} max={1} step={0.5} />)}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip
                placement="topLeft"
                title="速度/品质取舍从1（蛮力）到10（最快）。速度10有5％的质量下降，但比默认速度快8倍。">
                {getFieldDecorator('png-speed', {
                  initialValue: 3
                })(<InputNumber min={1} max={10} step={1} />)}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip placement="topLeft" title="禁用Floyd-Steinberg抖动">
                {getFieldDecorator('png-nofs', {
                  valuePropName: 'checked',
                  initialValue: false
                })(<Checkbox>nofs</Checkbox>)}
              </Tooltip>
            </Col>
          </div>
        </Row>
        <Divider dashed />
        <Row className={styles.PicOptions__row}>
          <div className={styles.PicOptions__label}>SVG高级:</div>
          <div className={styles.PicOptions__input}>
            <Tooltip placement="topLeft" title="SVG处理方式">
              {getFieldDecorator('svg-svgo', {
                initialValue: ['removeTitle', 'removeDesc', 'removeXMLNS']
              })(
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Please select">
                  {svgPlugin.map(item => {
                    return <Option key={`svg-${item.key}`} value={item.key}>{item.text}</Option>;
                  })}
                </Select>
              )}
            </Tooltip>
          </div>
        </Row>
        <Divider dashed />
        <Row className={styles.PicOptions__row}>
          <div className={styles.PicOptions__label}>GIF高级:</div>
          <div className={styles.PicOptions__input}>
            <Col span={8}>
              <Tooltip
                placement="topLeft"
                title="选择1到3之间的优化级别。&nbsp;&nbsp;1、只存储每个图像的变化部分&nbsp;&nbsp;2、还使用透明度进一步缩小文件&nbsp;&nbsp;3、尝试几种优化方法（通常较慢，有时更好的结果）">
                {getFieldDecorator('gif-optimizationLevel', {
                  initialValue: 2
                })(
                  <Select placeholder="Please select" style={{ width: 120 }}>
                    <Option value={1}>1</Option>
                    <Option value={2}>2</Option>
                    <Option value={3}>3</Option>
                  </Select>
                )}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip
                placement="topLeft"
                title="减少每个输出GIF中不同颜色的数量为num或更少。 Num必须在2到256之间">
                {getFieldDecorator('gif-colors')(
                  <InputNumber min={2} max={256} step={1} />
                )}
              </Tooltip>
            </Col>
          </div>
        </Row>
        <Divider dashed />
        <Row className={styles.PicOptions__row}>
          <div className={styles.PicOptions__label}>WebP高级:</div>
          <div className={styles.PicOptions__input}>
            <Col span={8}>
              <Tooltip placement="topLeft" title="自动调整过滤器强度">
                {getFieldDecorator('webp-autoFilter', {
                  valuePropName: 'checked',
                  initialValue: false
                })(<Checkbox>autoFilter</Checkbox>)}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip placement="topLeft" title="无损编码图像">
                {getFieldDecorator('webp-lossless', {
                  valuePropName: 'checked',
                  initialValue: true
                })(<Checkbox>lossless</Checkbox>)}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip
                placement="topLeft"
                title="预设设置，默认，照片，图片，绘图，图标和文本之一">
                {getFieldDecorator('webp-preset', {
                  initialValue: 'default'
                })(
                  <Select placeholder="Please select" style={{ width: 120 }}>
                    <Option value="default">default</Option>
                    <Option value="photo">photo</Option>
                    <Option value="picture">picture</Option>
                    <Option value="drawing">drawing</Option>
                    <Option value="icon">icon</Option>
                    <Option value="text">text</Option>
                  </Select>
                )}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip
                placement="topLeft"
                title="在0到100之间设置透明度压缩质量">
                {getFieldDecorator('webp-alphaQuality', {
                  initialValue: 100
                })(<InputNumber min={0} max={100} step={1} />)}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip
                placement="topLeft"
                title="指定要使用的压缩方法，介于0（最快）和6（最慢）之间。此参数控制编码速度与压缩文件大小和质量之间的折衷。">
                {getFieldDecorator('webp-method', {
                  initialValue: 4
                })(<InputNumber min={0} max={6} step={1} />)}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip
                placement="topLeft"
                title="设置0到100之间的空间噪声整形幅度。">
                {getFieldDecorator('webp-sns', {
                  initialValue: 80
                })(<InputNumber min={0} max={100} step={1} />)}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip
                placement="topLeft"
                title="在0（off）和100之间设置去块滤波器强度。">
                {getFieldDecorator('webp-filter')(
                  <InputNumber min={0} max={100} step={1} />
                )}
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip
                placement="topLeft"
                title="将滤镜清晰度设置在0（锐利）和7（最锐利）之间。">
                {getFieldDecorator('webp-sharpness', {
                  initialValue: 0
                })(<InputNumber min={0} max={7} step={1} />)}
              </Tooltip>
            </Col>
          </div>
        </Row>
        <Divider dashed />
      </div>
    );
  }
  renderCommon() {
    const { getFieldDecorator } = this.props.form;
    const { genParams } = this.props;
    const { gConfig } = genParams;

    return (
      <div>
        <div
          className={`${styles.PicOptions__row} ${
            styles.PicOptions__clearfix
          }`}>
          <Button
            style={{
              float: 'right',
              fontSize: 12,
              border: 'none',
              color: '#40a9ff'
            }}
            onClick={this.toggle}>
            高级设置 <Icon type={this.state.expandFormat ? 'up' : 'down'} />
          </Button>
        </div>
        {this.renderToWebp()}
        <div className={styles.PicOptions__row}>
          {getFieldDecorator('output', {
            initialValue: gConfig.output
          })(
            <Input
              onClick={this.handleOutput}
              placeholder="输出目录"
              prefix={<Icon type="folder-open" />}
            />
          )}
        </div>
        <div className={styles.PicOptions__row}>
          {this.renderGenBtn()}
          <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
            重置
          </Button>
        </div>
      </div>
    );
  }
  renderToWebp() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Row className={styles.PicOptions__row}>
        <div className={styles.PicOptions__label}>生产webP:</div>
        <div className={styles.PicOptions__input}>
          {getFieldDecorator('webp', {
            valuePropName: 'checked',
            initialValue: false
          })(<Switch />)}
        </div>
      </Row>
    );
  }

  renderGenBtn() {
    const { genParams } = this.props;
    const { fileList, gConfig } = genParams;

    if (fileList.length === 0 || gConfig.output === '') {
      return (
        <Button type="danger" ghost disabled>
          生成图片
        </Button>
      );
    } else {
      return (
        <Button
          type="danger"
          ghost
          htmlType="submit"
          onClick={this.handleSubmit}>
          生成图片
        </Button>
      );
    }
  }

  toggle = () => {
    const { expandFormat } = this.state;
    this.setState({
      expandFormat: !expandFormat
    });
  };

  render() {

    return <div styles={styles.PicOptions}>{this.renderSimpleFormat()}</div>;
  }
}

export default PicOptions;
