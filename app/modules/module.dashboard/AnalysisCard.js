import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import echarts from 'echarts';
import throttle from 'lodash/throttle';
import Card from './Card';

import styles from './index.less';

const DIMENSION_MAP = {
  count: '打开次数',
  serverCount: '运行次数',
  buildCount: '构建次数',
};

const chartOptions = {
  tooltip: {
    trigger: 'axis',
    showContent: false
  },
  xAxis: { gridIndex: 0, minInterval: 1 },
  yAxis: { type: 'category', axisLabel: { inside: false }, inverse: true },
  grid: { left: '10%', right: '50%' },
  series: [
    {
      type: 'bar',
      smooth: true,
      seriesLayoutBy: 'row',
      encode: {
        x: 'count',
        y: 'project',
      },
    },
    {
      type: 'pie',
      id: 'pie',
      radius: '50%',
      center: ['75%', '50%'],
    },
  ],
};

class AnalysisCard extends PureComponent {
  propTypes = {
    data: PropTypes.instanceOf(List).isRequired,
  }
  componentDidMount() {
    this.chart = echarts.init(this.chartNode);
    this.chart.setOption(chartOptions);
    let currentDimension;
    this.chart.on('updateAxisPointer', e => {
      const axisInfo = e.axesInfo[0];
      if (axisInfo) {
        const dimension = axisInfo.value + 1;
        if (currentDimension !== dimension) {
          currentDimension = dimension;
          this.chart.setOption({
            series: {
              id: 'pie',
              label: {
                formatter(params) {
                  return [DIMENSION_MAP[params.name], params.data[dimension]].join(': ');
                },
              },
              encode: {
                value: dimension,
                tooltip: dimension,
              },
            },
          });
        }
      }
    });
    this.updateDataView(this.props);
    window.addEventListener('resize', this.handleResize, false);
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.data.equals(this.props.data)) {
      this.updateDataView(nextProps);
    }
  }
  componentWillUnmount() {
    this.chart.dispose();
    window.removeEventListener('resize', this.handleResize, false);
  }
  handleResize = throttle(() => {
    this.chart.resize();
  }, 100)
  updateDataView(props) {
    const { data } = props;
    const source = [['name'], ['count'], ['serverCount'], ['buildCount']];
    data.groupBy(x => x.get('name'))
      .forEach((map, name) => {
        const mergedResult = map.reduce((p, c) => {
          return p.withMutations(m => {
            m
              .set('count', m.get('count', 0) + c.get('count', 0))
              .set('serverCount', m.get('serverCount', 0) + c.get('serverCount', 0))
              .set('buildCount', m.get('buildCount', 0) + c.get('buildCount', 0));
          });
        }, Map({ name }));
        source[0].push(mergedResult.get('name'));
        source[1].push(mergedResult.get('count'));
        source[2].push(mergedResult.get('serverCount'));
        source[3].push(mergedResult.get('buildCount'));
      });
    // const plotSource = source.slice(0, 10).map(v => [v.name, v.count, v.serverCount, v.buildCount]);
    // console.log(source);
    this.chart.setOption({
      dataset: {
        source: source
      },
      series: {
        id: 'pie',
        label: {
          formatter(params) {
            return [DIMENSION_MAP[params.name], params.data[1]].join(': ');
          },
        },
        encode: {
          itemName: 'name',
          value: source[0][1],
        },
      },
    });
  }
  renderSwitch() {

  }
  renderChart() {
    return (
      <div
        className={styles.AnalysisCard__Chart}
        ref={node => this.chartNode = node}
      />
    );
  }
  render() {
    return (
      <Card className={styles.AnalysisCard}>
        <h3>统计</h3>
        { this.renderSwitch() }
        { this.renderChart() }
      </Card>
    );
  }
}

export default AnalysisCard;
