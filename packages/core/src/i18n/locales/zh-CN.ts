/**
 * 简体中文语言包
 */

import type { I18nMessages } from '../../types';

export const zhCN: I18nMessages = {
  // 星期
  weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  weekdaysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  weekdaysMin: ['日', '一', '二', '三', '四', '五', '六'],

  // 月份
  months: [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月',
  ],
  monthsShort: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ],

  // 按钮
  today: '今天',
  clear: '清除',
  confirm: '确定',
  cancel: '取消',

  // 视图
  year: '年',
  month: '月',
  week: '周',
  day: '日',

  // 其他
  selectDate: '选择日期',
  selectTime: '选择时间',
  startDate: '开始日期',
  endDate: '结束日期',
  startTime: '开始时间',
  endTime: '结束时间',
  
  // 事件
  event: '事件',
  events: '事件',
  allDay: '全天',
  createEvent: '创建事件',
  editEvent: '编辑事件',
  deleteEvent: '删除事件',
  eventTitle: '事件标题',
  eventDescription: '事件描述',
  
  // 重复
  repeat: '重复',
  repeatDaily: '每天',
  repeatWeekly: '每周',
  repeatMonthly: '每月',
  repeatYearly: '每年',
  repeatCustom: '自定义',
  
  // 提醒
  reminder: '提醒',
  noReminder: '不提醒',
  atTimeOfEvent: '事件开始时',
  minutesBefore: '{0}分钟前',
  hoursBefore: '{0}小时前',
  daysBefore: '{0}天前',
  
  // 错误信息
  invalidDate: '无效的日期',
  invalidTime: '无效的时间',
  invalidRange: '无效的日期范围',
  startMustBeforeEnd: '开始日期必须早于结束日期',
  
  // 格式
  dateFormat: 'YYYY年MM月DD日',
  timeFormat: 'HH:mm',
  dateTimeFormat: 'YYYY年MM月DD日 HH:mm',
};