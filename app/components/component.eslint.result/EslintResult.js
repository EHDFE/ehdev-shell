/**
 * Eslint Result Component
 * @author ryan.bian
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Tag } from 'antd';
import G2 from '@antv/g2';

import styles from './index.less';

// 关闭 G2 的体验改进计划打点请求
G2.track(false);

const columns = [{
  title: 'Path',
  dataIndex: 'filePath',
  render: (text, row, index) => {
    return {
      children: text,
      props: {
        rowSpan: row.rowSpan,
      },
    };
  },
}, {
  title: 'Line',
  dataIndex: 'line',
  width: 70,
}, {
  title: 'Column',
  width: 70,
  dataIndex: 'column',
}, {
  title: 'Type',
  width: 70,
  dataIndex: 'severity',
  /* eslint-disable react/display-name */
  render: (text, row, index) => {
    if (text === 1) {
      return <Tag color="#fa0">warn</Tag>;
    } else {
      return <Tag color="#f50">error</Tag>;
    }
  },
}, {
  title: 'Message',
  dataIndex: 'message',
}, {
  title: 'Rule ID',
  dataIndex: 'ruleId',
  /* eslint-disable react/display-name */
  render: text => (
    <a
      href={`https://eslint.org/docs/rules/${text}`}
      target="_blank"
    >{text}</a>
  ),
}];

class EslintResult extends Component {
  static propTypes = {
    rootPath: PropTypes.string,
    data: PropTypes.array,
  }
  state = {
    data: this.updateData(this.props.data, this.props.rootPath),
  };
  componentDidMount() {
    // this.overallChart = new G2.Chart({
    //   container: this.overallNode,
    //   forceFit: true,
    // });
    // this.updateChart(this.props.data);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      data: this.updateData(nextProps.data, nextProps.rootPath),
    });
  }
  updateData(data, rootPath) {
    const errorData = data
      .filter(d => d.errorCount !== 0 || d.warningCount !== 0);
    const renderData = errorData.reduce((prev, d) => {
      return prev.concat(d.messages.map((o, i) => Object.assign({}, o, {
        filePath: d.filePath.replace(rootPath, '${projectRoot}'),
        source: d.source,
        rowSpan: i >= 1 ? 0 : d.messages.length,
      })));
    }, []);
    return renderData;
  }
  render() {
    // <div
    //   className={styles.EslintResult__SummaryGrid}
    //   ref={node => this.overallNode = node}
    // />
    const { data } = this.state;
    const props = {
      pagination: false,
      size: 'middle',
    };
    return (
      <div className={styles.EslintResult}>
        <Table {...props} columns={columns} dataSource={data} />
      </div>
    );
  }
}

export default EslintResult;
