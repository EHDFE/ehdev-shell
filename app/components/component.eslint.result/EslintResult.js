/**
 * Eslint Result Component
 * @author ryan.bian
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Tag, Icon, message } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';

import styles from './index.less';

const columns = [{
  title: 'Line',
  dataIndex: 'line',
  key: 'line',
  width: 70,
}, {
  title: 'Column',
  width: 70,
  dataIndex: 'column',
  key: 'column',
}, {
  title: 'Type',
  width: 70,
  dataIndex: 'severity',
  key: 'severity',
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
  key: 'message',
}, {
  title: 'Rule ID',
  dataIndex: 'ruleId',
  key: 'ruleId',
  /* eslint-disable react/display-name */
  render: text => (
    <a
      href={`https://eslint.org/docs/rules/${text}`}
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
    // console.log('componentDidMount');
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      data: this.updateData(nextProps.data, nextProps.rootPath),
    });
  }
  updateData(data, rootPath) {
    const errorData = data
      .filter(d => d.errorCount !== 0 || d.warningCount !== 0);
    // const renderData = errorData.reduce((prev, d) => {
    //   return prev.concat(d.messages.map((o, i) => Object.assign({}, o, {
    //     filePath: d.filePath.replace(rootPath, '${projectRoot}'),
    //     source: d.source,
    //     rowSpan: i >= 1 ? 0 : d.messages.length,
    //   })));
    // }, []);
    return errorData;
  }
  afterCopy() {
    message.success('已复制');
  }
  render() {
    // <div
    //   className={styles.EslintResult__SummaryGrid}
    //   ref={node => this.overallNode = node}
    // />
    const { data } = this.state;
    const props = {
      pagination: false,
      size: 'small',
      className: styles.EslintResult__Table,
    };
    return (
      <div className={styles.EslintResult}>
        {
          data.map(d => (
            <Table
              {...props}
              key={d.filePath}
              title={() => [
                d.filePath,
                <CopyToClipboard
                  key="copy"
                  text={d.filePath}
                  onCopy={this.afterCopy}
                >
                  <Icon type="copy" className={styles.EslintResult__CopyButton} />
                </CopyToClipboard>,
              ]}
              columns={columns}
              dataSource={d.messages}
            />
          ))
        }
      </div>
    );
  }
}

export default EslintResult;
