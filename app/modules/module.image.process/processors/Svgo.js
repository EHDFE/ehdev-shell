import { PureComponent, Fragment } from 'react';
import { Switch } from 'antd';
import PropTypes from 'prop-types';
import processorHoc from '../processorHoc';
import ProcessItem from '../ProcessItem';

const SVGO_OPTIONS = new Map([
  ['cleanupAttrs', '清除换行，结束符以及重复空格'],
  ['removeDoctype', '删除文档类型声明'],
  ['removeXMLProcInst', 'remove XML processing instructions'],
  ['removeComments', '删除注释'],
  ['removeMetadata', '删除 <metadata>'],
  ['removeTitle', '删除 <title>'],
  ['removeDesc', '删除 <desc>'],
  ['removeUselessDefs', '删除没有 id 的 <defs>'],
  ['removeXMLNS', '删除 xmlns 属性'],
  ['removeEditorsNSData', '删除修改人的命名空间、节点和属性'],
  ['removeEmptyAttrs', '删除空的属性'],
  ['removeHiddenElems', '删除隐藏节点'],
  ['removeEmptyText', '删除空的文本节点'],
  ['removeEmptyContainers', '删除空的容器节点'],
  ['removeViewBox', '如果可以，删除 viewBox 属性'],
  ['cleanupEnableBackground', '如果可以，删除或者清空 enable-background 属性'],
  ['minifyStyles', '使用 CSSO 压缩 <style> 标签'],
  ['convertStyleToAttrs', 'styles 转换成属性'],
  ['convertColors', '颜色转换，(从 rgb() 到 #rrggbb, #rrggbb 到 #rgb)'],
  ['convertPathData', '将路径转换成相对值或绝对值（以较短者为准）'],
  ['convertTransform', '合并多个 transforms'],
  ['removeUnknownsAndDefaults', '删除未知的节点内容和属性，删除默认值属性'],
  ['removeNonInheritableGroupAttrs', '删除不可继承组的 "presentation" 属性'],
  ['removeUselessStrokeAndFill', '删除无用的 stoke 和 fill 属性'],
  ['removeUnusedNS', '删除无用的命名空间声明'],
  ['cleanupIDs', '删除无用 ID, 使用更简短的 ID'],
  ['cleanupNumericValues', '四舍五入数值到固定的精度，移除默认的px单位'], // params
  [
    'cleanupListOfValues',
    '四舍五入属性中的数值(如 viewBox 或 enable-background)',
  ],
  ['moveElemsAttrsToGroup', '移动元素属性们到外面包裹的组元素上'],
  ['moveGroupAttrsToElems', '移动一些组属性到内容元素上'],
  ['collapseGroups', '合并无用的组'],
  ['removeRasterImages', '删除点阵图像'],
  ['mergePaths', '合并多个路径为一个'],
  ['convertShapeToPath', '转换一些基本图形为路径'],
  ['sortAttrs', '按可读性给节点的属性排序'],
  ['removeDimensions', '如果存在 viewBox，删除 width/height 属性'],
  // ['removeAttrs', '按规则删除属性'], // params
  // ['removeElementsByAttr', '按照 ID 或者 className 删除节点'], // params
  // ['addClassesToSVGElement', '给外层 svg 标签添加 classnames'],  // params
  // ['addAttributesToSVGElement', '给外层 svg 标签添加属性'], // params
  ['removeStyleElement', '删除 <style> 节点'],
  ['removeScriptElement', '删除 <script> 节点'],
]);

export const defaultConfig = {
  cleanupAttrs: true,
  removeDoctype: true,
  removeXMLProcInst: true,
  removeComments: true,
  removeMetadata: true,
  removeTitle: true,
  removeDesc: true,
  removeUselessDefs: true,
  removeXMLNS: false,
  removeEditorsNSData: true,
  removeEmptyAttrs: true,
  removeHiddenElems: true,
  removeEmptyText: true,
  removeEmptyContainers: true,
  removeViewBox: true,
  cleanupEnableBackground: true,
  minifyStyles: true,
  convertStyleToAttrs: true,
  convertColors: true,
  convertPathData: true,
  convertTransform: true,
  removeUnknownsAndDefaults: true,
  removeNonInheritableGroupAttrs: true,
  removeUselessStrokeAndFill: true,
  removeUnusedNS: true,
  cleanupIDs: true,
  cleanupNumericValues: true,
  cleanupListOfValues: true,
  moveElemsAttrsToGroup: true,
  moveGroupAttrsToElems: true,
  collapseGroups: true,
  removeRasterImages: false,
  mergePaths: true,
  convertShapeToPath: true,
  sortAttrs: false,
  removeDimensions: false,
  // removeAttrs: false,
  // removeElementsByAttr: false,
  // addClassesToSVGElement: false,
  // addAttributesToSVGElement: false,
  removeStyleElement: false,
  removeScriptElement: false,
};

@processorHoc()
class Svgo extends PureComponent {
  static processorName = 'svgo';
  static propTypes = {
    form: PropTypes.object,
    config: PropTypes.object,
  };
  static getDerivedStateFromProps(props, state) {
    return Object.assign(state, props.config);
  }
  state = defaultConfig;
  render() {
    const { getFieldDecorator } = this.props.form;
    const configs = [];
    SVGO_OPTIONS.forEach((value, key) => {
      configs.push(
        <ProcessItem key={key} label={key} extra={value} align={'vertical'}>
          {getFieldDecorator(key, {
            valuePropName: 'checked',
            initialValue: this.state[key],
          })(<Switch size="small" />)}
        </ProcessItem>,
      );
    });
    return <Fragment>{configs}</Fragment>;
  }
}

export default Svgo;
