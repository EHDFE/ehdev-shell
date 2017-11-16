/**
 * 黄历 component
 * @refer to: https://github.com/leizongmin/programmer-calendar
 * @author: ryan.bian
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Rate, Icon } from 'antd';

import defineData from './define';
import styles from './index.less';

const getDateValue = date =>
  date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
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
function parse(date, event) {
  let result = {
    name: event.name,
    good: event.good,
    bad: event.bad,
  }; // clone

  const iday = getDateValue(date);

  if (result.name.indexOf('%v') != -1) {
    result.name = result.name.replace(
      '%v',
      defineData.varNames[random(iday, 12) % defineData.varNames.length]
    );
  }

  if (result.name.indexOf('%t') != -1) {
    result.name = result.name.replace(
      '%t',
      defineData.tools[random(iday, 11) % defineData.tools.length]
    );
  }

  if (result.name.indexOf('%l') != -1) {
    result.name = result.name.replace(
      '%l',
      (random(iday, 12) % 247 + 30).toString()
    );
  }

  return result;
}

// 从 activities 中随机挑选 size 个
function pickRandomActivity(date, activities, size) {
  let picked_events = pickRandom(date, activities, size);

  for (let i = 0; i < picked_events.length; i++) {
    picked_events[i] = parse(date, picked_events[i]);
  }

  return picked_events;
}

// 从数组中随机挑选 size 个
function pickRandom(date, array, size) {
  let result = [];

  for (let i = 0; i < array.length; i++) {
    result.push(array[i]);
  }

  for (let j = 0; j < array.length - size; j++) {
    let index = random(getDateValue(date), j) % result.length;
    result.splice(index, 1);
  }

  return result;
}

function star(num) {
  let result = [];
  let i = 0;
  while (i < num) {
    result.push('★');
    i++;
  }
  while (i < 5) {
    result.push('☆');
    i++;
  }
  return result.join(' ');
}

function isWeekend(date) {
  return date.getDay() == 0 || date.getDay() == 6;
}

// 去掉一些不合今日的事件
function filter(date, activities) {
  let result = [];

  // 周末的话，只留下 weekend = true 的事件
  if (isWeekend(date)) {
    for (let i = 0; i < activities.length; i++) {
      if (activities[i].weekend) {
        result.push(activities[i]);
      }
    }

    return result;
  }

  return activities;
}

// 添加预定义事件
function pickSpecials(date) {
  let goodList = [];
  let badList = [];

  const iday = getDateValue(date);

  for (let i = 0; i < defineData.specials.length; i++) {
    let special = defineData.specials[i];

    if (iday == special.date) {
      if (special.type == 'good') {
        goodList.push({
          name: special.name,
          good: special.description,
        });
      } else {
        badList.push({
          name: special.name,
          bad: special.description,
        });
      }
    }
  }

  return { good: goodList, bad: badList };
}

// 生成今日运势
function pickTodaysLuck(date) {
  let _activities = filter(date, defineData.activities);
  const iday = getDateValue(date);

  let numGood = random(iday, 98) % 3 + 2;
  let numBad = random(iday, 87) % 3 + 2;
  let eventArr = pickRandomActivity(date, _activities, numGood + numBad);

  let special = pickSpecials(date);

  let goodList = special.good;
  let badList = special.bad;

  for (let i = 0; i < numGood; i++) {
    goodList.push(eventArr[i]);
  }

  for (let i = 0; i < numBad; i++) {
    badList.push(eventArr[numGood + i]);
  }

  return { good: goodList.slice(0, 4), bad: badList.slice(0, 4) };
}

const getTodayString = date => {
  return (
    '今天是' +
    date.getFullYear() +
    '年' +
    (date.getMonth() + 1) +
    '月' +
    date.getDate() +
    '日 星期' +
    defineData.weeks[date.getDay()]
  );
};

const getDirectionString = date =>
  defineData.directions[random(getDateValue(date), 2) % defineData.directions.length];

const getDrinkString = date => pickRandom(date, defineData.drinks, 2).join('，');
const getStarValue = date => random(getDateValue(date), 6) % 5 + 1;

const Almanac = ({ date }) => {
  const startValue = getStarValue(date);
  const { good, bad } = pickTodaysLuck(date);
  const direction = getDirectionString(date);
  return (
    <section className={styles.Almanac}>
      <p className={styles.Almanac__Rule}>{getTodayString(date)}</p>
      <p className={styles.Almanac__Rule}>座位朝向：面向<b className={styles.Almanac__Direction}>{direction}</b>写程序，BUG 最少。</p>
      <p className={styles.Almanac__Rule}>{`今日宜饮：${getDrinkString(date)}`}</p>
      <div className={styles.Almanac__Rule}>
        女神亲近指数：
        <Rate
          character={<Icon type="heart" />}
          value={startValue}
          disabled
        />
      </div>
      <div className={styles.Almanac__Lucks}>
        <div className={styles['Almanac__Lucks--good']}>
          <h5>宜</h5>
          {
            good.map(d => (
              <div className={styles.Almanac__LuckItem} key={d.name}>
                <p className={styles['Almanac__LuckItem--name']}>{d.name}</p>
                <p className={styles['Almanac__LuckItem--desc']}>{d.good}</p>
              </div>
            ))
          }
        </div>
        <div className={styles['Almanac__Lucks--bad']}>
          <h5>忌</h5>
          {
            bad.map(d => (
              <div className={styles.Almanac__LuckItem} key={d.name}>
                <p className={styles['Almanac__LuckItem--name']}>{d.name}</p>
                <p className={styles['Almanac__LuckItem--desc']}>{d.bad}</p>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  );
};

Almanac.defaultProps = {
  date: new Date(),
};

Almanac.propTypes = {
  date: PropTypes.instanceOf(Date),
};

export default Almanac;
