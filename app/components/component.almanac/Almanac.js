/**
 * 黄历 component
 * @refer to: https://github.com/leizongmin/programmer-calendar
 * @author: ryan.bian
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Rate, Icon } from 'antd';
import moment from 'moment';

import defineData from './define';
import styles from './index.less';

const getDateValue = m =>
  m.year() * 10000 + (m.month() + 1) * 100 + m.date();
/*
 * 注意：本程序中的“随机”都是伪随机概念，以当前的天为种子。
 */
function random(dayseed, indexseed) {
  let n = dayseed % 11117;
  for (let i = 0; i < 100 + indexseed; i++) {
    n = n * n;
    n = n % 11117; // 11117 是个质数
  }
  return n;
}

// 解析占位符并替换成随机内容
// function parse(m, event) {
//   let result = {
//     name: event.name,
//     good: event.good,
//     bad: event.bad,
//   }; // clone

//   const iday = getDateValue(m);

//   if (result.name.indexOf('%v') != -1) {
//     result.name = result.name.replace(
//       '%v',
//       defineData.varNames[random(iday, 12) % defineData.varNames.length]
//     );
//   }

//   if (result.name.indexOf('%t') != -1) {
//     result.name = result.name.replace(
//       '%t',
//       defineData.tools[random(iday, 11) % defineData.tools.length]
//     );
//   }

//   if (result.name.indexOf('%l') != -1) {
//     result.name = result.name.replace(
//       '%l',
//       (random(iday, 12) % 247 + 30).toString()
//     );
//   }

//   return result;
// }

// 从 activities 中随机挑选 size 个
// function pickRandomActivity(m, activities, size) {
//   let picked_events = pickRandom(m, activities, size);

//   for (let i = 0; i < picked_events.length; i++) {
//     picked_events[i] = parse(m, picked_events[i]);
//   }

//   return picked_events;
// }

// 从数组中随机挑选 size 个
function pickRandom(m, array, size) {
  let result = [];

  for (let i = 0; i < array.length; i++) {
    result.push(array[i]);
  }

  for (let j = 0; j < array.length - size; j++) {
    let index = random(getDateValue(m), j) % result.length;
    result.splice(index, 1);
  }

  return result;
}

// function isWeekend(m) {
//   return m.day() == 0 || m.day() == 6;
// }

// 去掉一些不合今日的事件
// function filter(m, activities) {
//   let result = [];

//   // 周末的话，只留下 weekend = true 的事件
//   if (isWeekend(m)) {
//     for (let i = 0; i < activities.length; i++) {
//       if (activities[i].weekend) {
//         result.push(activities[i]);
//       }
//     }

//     return result;
//   }

//   return activities;
// }

// 添加预定义事件
// function pickSpecials(m) {
//   let goodList = [];
//   let badList = [];

//   const date = m.format('MM-DD');
//   const match = defineData.specials.find(d => d.date === date);
//   if (match) {
//     if (match.type === 'good') {
//       goodList.push({
//         name: match.name,
//         good: match.description,
//       });
//     } else if (match.type === 'bad') {
//       badList.push({
//         name: match.name,
//         bad: match.description,
//       });
//     }
//   }

//   return { good: goodList, bad: badList };
// }

// 生成今日运势
// function pickTodaysLuck(m) {
//   let _activities = filter(m, defineData.activities);
//   const iday = getDateValue(m);

//   let numGood = random(iday, 98) % 3 + 2;
//   let numBad = random(iday, 87) % 3 + 2;
//   let eventArr = pickRandomActivity(m, _activities, numGood + numBad);

//   let special = pickSpecials(m);

//   let goodList = special.good;
//   let badList = special.bad;

//   for (let i = 0; i < numGood; i++) {
//     goodList.push(eventArr[i]);
//   }

//   for (let i = 0; i < numBad; i++) {
//     badList.push(eventArr[numGood + i]);
//   }

//   return { good: goodList.slice(0, 4), bad: badList.slice(0, 4) };
// }

const getTodayString = m => {
  return (
    '今天是' +
    m.year() +
    '年' +
    (m.month() + 1) +
    '月' +
    m.date() +
    '日 星期' +
    defineData.weeks[m.day()]
  );
};

const getDirectionString = date =>
  defineData.directions[random(getDateValue(date), 2) % defineData.directions.length];

const getDrinkString = date => pickRandom(date, defineData.drinks, 2).join('，');
const getStarValue = date => random(getDateValue(date), 6) % 5 + 1;

export default class Almanac extends PureComponent {
  static propTypes = {
    date: PropTypes.string,
  }
  render() {
    const { date } = this.props;
    const m = date ? moment(date) : moment();
    const startValue = getStarValue(m);
    // const { good, bad } = pickTodaysLuck(m);
    const direction = getDirectionString(m);
    return (
      <section className={styles.Almanac}>
        <p className={styles.Almanac__Rule}>{getTodayString(m)}</p>
        <p className={styles.Almanac__Rule}>座位朝向：面向<b className={styles.Almanac__Direction}>{direction}</b>写程序，BUG 最少。</p>
        <p className={styles.Almanac__Rule}>{`今日宜饮：${getDrinkString(m)}`}</p>
        <div className={styles.Almanac__Rule}>
          女神亲近指数：
          <Rate
            className={styles.Almanac__RomanceRate}
            character={<Icon type="heart" />}
            value={startValue}
            disabled
          />
        </div>
      </section>
    );
    // <div className={styles.Almanac__Lucks}>
    //   <h5 className={styles['Almanac__Lucks--goodTitle']}>宜</h5>
    //   <div className={styles['Almanac__Lucks--good']}>
    //     {
    //       good.map(d => (
    //         <div className={styles.Almanac__LuckItem} key={d.name}>
    //           <p className={styles['Almanac__LuckItem--name']}>{d.name}</p>
    //           <p className={styles['Almanac__LuckItem--desc']}>{d.good}</p>
    //         </div>
    //       ))
    //     }
    //   </div>
    //   <h5 className={styles['Almanac__Lucks--badTitle']}>忌</h5>
    //   <div className={styles['Almanac__Lucks--bad']}>
    //     {
    //       bad.map(d => (
    //         <div className={styles.Almanac__LuckItem} key={d.name}>
    //           <p className={styles['Almanac__LuckItem--name']}>{d.name}</p>
    //           <p className={styles['Almanac__LuckItem--desc']}>{d.bad}</p>
    //         </div>
    //       ))
    //     }
    //   </div>
    // </div>
  }
}
