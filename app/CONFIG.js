/**
 * APP CONFIG FILE
 * @author ryan.bian
 */

// 全局菜单配置
export const GLOBAL_NAV_CONFIG = [
  {
    to: '/project',
    icon: 'code',
    text: '工程',
  },
  {
    to: '/upload',
    icon: 'cloud-upload',
    text: '上传',
  },
  {
    to: '/configer',
    icon: 'api',
    text: '引擎库',
  },
  {
    to: '/images',
    icon: 'picture',
    text: '图片处理'
  },
  {
    to: '/qrcode',
    icon: 'qrcode',
    text: '二维码'
  },
  {
    to: '/user',
    icon: 'user',
    text: '个人中心',
  },
];

export const GREETING_WORDS = new Map([
  [0, '加班辛苦了'],
  [1, '新的一周开始了，加油哦'],
  [2, '努力工作，今晚吃鸡'],
  [3, '努力工作，今晚吃鸡'],
  [4, '努力工作，今晚吃鸡'],
  [5, '周五了，记得加餐'],
  [6, '加班辛苦了'],
]);

export const WEATHER_APPID = 'b8fbb9f6ccb49e615a21bae76f87738d';

export const RAVEN_ID = 'https://d2e7d99b1c414fe0ab0b02b67f17c1c8@sentry.io/247420';
