/**
 * @ldesign/calendar - 中文语言包
 */

import type { Locale } from '../types';

const zhCN: Locale = {
  code: 'zh-CN',
  name: '简体中文',
  direction: 'ltr',
  firstDayOfWeek: 1, // 周一

  months: [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ],

  monthsShort: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ],

  weekdays: [
    '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'
  ],

  weekdaysShort: [
    '周日', '周一', '周二', '周三', '周四', '周五', '周六'
  ],

  weekdaysMin: [
    '日', '一', '二', '三', '四', '五', '六'
  ],

  dateFormats: {
    short: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    full: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }
  },

  timeFormats: {
    short: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    long: {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }
  },

  ui: {
    today: '今天',
    month: '月',
    week: '周',
    day: '日',
    agenda: '日程',
    noEvents: '暂无事件',
    allDay: '全天',
    createEvent: '创建事件',
    editEvent: '编辑事件',
    deleteEvent: '删除事件',
    saveEvent: '保存',
    cancelEdit: '取消',
    eventTitle: '标题',
    eventDescription: '描述',
    eventLocation: '地点',
    eventStart: '开始时间',
    eventEnd: '结束时间',
    moreEvents: '还有 {count} 个事件',
    loading: '加载中...',
    error: '出错了',
    previousMonth: '上个月',
    nextMonth: '下个月',
    previousWeek: '上一周',
    nextWeek: '下一周',
    previousDay: '前一天',
    nextDay: '后一天'
  },

  messages: {
    confirmDelete: '确定要删除这个事件吗？',
    eventCreated: '事件创建成功',
    eventUpdated: '事件更新成功',
    eventDeleted: '事件已删除',
    errorSaving: '保存失败，请重试',
    errorDeleting: '删除失败，请重试',
    errorLoading: '加载失败，请刷新页面',
    invalidDate: '无效的日期',
    invalidTimeRange: '结束时间必须晚于开始时间'
  },

  recurrence: {
    daily: '每天',
    weekly: '每周',
    monthly: '每月',
    yearly: '每年',
    repeat: '重复',
    every: '每',
    days: '天',
    weeks: '周',
    months: '月',
    years: '年',
    on: '在',
    until: '直到',
    count: '次数',
    occurrences: '次',
    weekdays: {
      sunday: '周日',
      monday: '周一',
      tuesday: '周二',
      wednesday: '周三',
      thursday: '周四',
      friday: '周五',
      saturday: '周六'
    }
  }
};

export default zhCN;
