/**
 * @ldesign/calendar - RRULE 解析器
 * 实现简化版的 RFC 5545 重复规则
 */

import type { RecurrenceRule, CalendarEvent, Weekday } from '../types';
import { RecurrenceFrequency } from '../types';
import { addDays, addWeeks, addMonths, addYears, cloneDate } from './date-utils';

/**
 * 解析 RRULE 字符串
 * 格式: FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR;COUNT=10
 */
export function parseRRule(rruleString: string): RecurrenceRule {
  const parts = rruleString.split(';');
  const rule: Partial<RecurrenceRule> = {};

  parts.forEach(part => {
    const [key, value] = part.split('=');

    switch (key) {
      case 'FREQ':
        rule.freq = value.toLowerCase() as RecurrenceFrequency;
        break;
      case 'INTERVAL':
        rule.interval = parseInt(value, 10);
        break;
      case 'COUNT':
        rule.count = parseInt(value, 10);
        break;
      case 'UNTIL':
        rule.until = new Date(value);
        break;
      case 'BYDAY':
        rule.byweekday = parseByDay(value);
        break;
      case 'BYMONTHDAY':
        rule.bymonthday = value.split(',').map(v => parseInt(v, 10));
        break;
      case 'BYMONTH':
        rule.bymonth = value.split(',').map(v => parseInt(v, 10));
        break;
    }
  });

  return rule as RecurrenceRule;
}

/**
 * 解析 BYDAY 参数
 */
function parseByDay(value: string): Weekday[] {
  const dayMap: Record<string, Weekday> = {
    'SU': 0,
    'MO': 1,
    'TU': 2,
    'WE': 3,
    'TH': 4,
    'FR': 5,
    'SA': 6,
  };

  return value.split(',').map(day => dayMap[day]);
}

/**
 * 将 RecurrenceRule 转换为 RRULE 字符串
 */
export function toRRuleString(rule: RecurrenceRule): string {
  const parts: string[] = [];

  parts.push(`FREQ=${rule.freq.toUpperCase()}`);

  if (rule.interval && rule.interval > 1) {
    parts.push(`INTERVAL=${rule.interval}`);
  }

  if (rule.count) {
    parts.push(`COUNT=${rule.count}`);
  }

  if (rule.until) {
    parts.push(`UNTIL=${rule.until.toISOString()}`);
  }

  if (rule.byweekday && rule.byweekday.length > 0) {
    const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const days = rule.byweekday.map(d => dayMap[d]).join(',');
    parts.push(`BYDAY=${days}`);
  }

  if (rule.bymonthday && rule.bymonthday.length > 0) {
    parts.push(`BYMONTHDAY=${rule.bymonthday.join(',')}`);
  }

  if (rule.bymonth && rule.bymonth.length > 0) {
    parts.push(`BYMONTH=${rule.bymonth.join(',')}`);
  }

  return parts.join(';');
}

/**
 * 展开重复事件（生成指定时间范围内的所有实例）
 */
export function expandRecurrence(
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date,
  maxInstances: number = 100
): CalendarEvent[] {
  if (!event.recurrence) {
    // 非重复事件，检查是否在范围内
    if (event.start <= rangeEnd && event.end >= rangeStart) {
      return [event];
    }
    return [];
  }

  const instances: CalendarEvent[] = [];
  const rule = event.recurrence;
  const interval = rule.interval || 1;

  // 计算事件时长（分钟）
  const durationMs = event.end.getTime() - event.start.getTime();

  let currentDate = cloneDate(event.start);
  let count = 0;

  // 生成实例
  while (count < maxInstances) {
    // 检查是否超过结束条件
    if (rule.count && instances.length >= rule.count) {
      break;
    }

    if (rule.until && currentDate > rule.until) {
      break;
    }

    if (currentDate > rangeEnd) {
      break;
    }

    // 检查是否符合 BYDAY 规则
    if (rule.byweekday && rule.byweekday.length > 0) {
      if (!rule.byweekday.includes(currentDate.getDay() as Weekday)) {
        currentDate = getNextOccurrence(currentDate, rule, interval);
        count++;
        continue;
      }
    }

    // 检查是否符合 BYMONTHDAY 规则
    if (rule.bymonthday && rule.bymonthday.length > 0) {
      if (!rule.bymonthday.includes(currentDate.getDate())) {
        currentDate = getNextOccurrence(currentDate, rule, interval);
        count++;
        continue;
      }
    }

    // 检查是否符合 BYMONTH 规则
    if (rule.bymonth && rule.bymonth.length > 0) {
      if (!rule.bymonth.includes(currentDate.getMonth() + 1)) {
        currentDate = getNextOccurrence(currentDate, rule, interval);
        count++;
        continue;
      }
    }

    // 在范围内则创建实例
    if (currentDate >= rangeStart) {
      const instanceEnd = new Date(currentDate.getTime() + durationMs);

      instances.push({
        ...event,
        id: `${event.id}_${currentDate.getTime()}`,
        start: cloneDate(currentDate),
        end: instanceEnd,
        originalEventId: event.id,
      });
    }

    // 移动到下一个日期
    currentDate = getNextOccurrence(currentDate, rule, interval);
    count++;
  }

  return instances;
}

/**
 * 获取下一个重复日期
 */
function getNextOccurrence(date: Date, rule: RecurrenceRule, interval: number): Date {
  switch (rule.freq) {
    case RecurrenceFrequency.Daily:
      return addDays(date, interval);

    case RecurrenceFrequency.Weekly:
      // 如果有 BYDAY 规则，需要特殊处理
      if (rule.byweekday && rule.byweekday.length > 0) {
        return getNextWeekdayOccurrence(date, rule.byweekday);
      }
      return addWeeks(date, interval);

    case RecurrenceFrequency.Monthly:
      return addMonths(date, interval);

    case RecurrenceFrequency.Yearly:
      return addYears(date, interval);

    default:
      return addDays(date, 1);
  }
}

/**
 * 获取下一个符合星期规则的日期
 */
function getNextWeekdayOccurrence(date: Date, weekdays: Weekday[]): Date {
  const sortedWeekdays = [...weekdays].sort((a, b) => a - b);
  const currentDay = date.getDay();

  // 查找下一个符合的星期
  for (const weekday of sortedWeekdays) {
    if (weekday > currentDay) {
      return addDays(date, weekday - currentDay);
    }
  }

  // 如果没有找到，移动到下周的第一个符合星期
  const daysToAdd = 7 - currentDay + sortedWeekdays[0];
  return addDays(date, daysToAdd);
}

/**
 * 验证重复规则
 */
export function validateRecurrenceRule(rule: RecurrenceRule): string[] {
  const errors: string[] = [];

  if (!rule.freq) {
    errors.push('频率不能为空');
  }

  if (rule.interval && rule.interval < 1) {
    errors.push('间隔必须大于等于 1');
  }

  if (rule.count && rule.count < 1) {
    errors.push('重复次数必须大于等于 1');
  }

  if (rule.until && rule.count) {
    errors.push('不能同时指定结束日期和重复次数');
  }

  if (rule.byweekday && rule.freq !== RecurrenceFrequency.Weekly) {
    errors.push('BYDAY 规则仅适用于每周重复');
  }

  if (rule.bymonthday && rule.freq !== RecurrenceFrequency.Monthly) {
    errors.push('BYMONTHDAY 规则仅适用于每月重复');
  }

  if (rule.bymonth && rule.freq !== RecurrenceFrequency.Yearly) {
    errors.push('BYMONTH 规则仅适用于每年重复');
  }

  return errors;
}

/**
 * 生成人类可读的重复规则描述
 */
export function getRecurrenceDescription(rule: RecurrenceRule, locale: string = 'zh'): string {
  const interval = rule.interval || 1;
  const parts: string[] = [];

  // 基础频率
  switch (rule.freq) {
    case RecurrenceFrequency.Daily:
      if (interval === 1) {
        parts.push(locale === 'zh' ? '每天' : 'Daily');
      } else {
        parts.push(locale === 'zh' ? `每 ${interval} 天` : `Every ${interval} days`);
      }
      break;

    case RecurrenceFrequency.Weekly:
      if (interval === 1) {
        parts.push(locale === 'zh' ? '每周' : 'Weekly');
      } else {
        parts.push(locale === 'zh' ? `每 ${interval} 周` : `Every ${interval} weeks`);
      }

      if (rule.byweekday && rule.byweekday.length > 0) {
        const dayNames = locale === 'zh'
          ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
          : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = rule.byweekday.map(d => dayNames[d]).join(', ');
        parts.push(locale === 'zh' ? `在 ${days}` : `on ${days}`);
      }
      break;

    case RecurrenceFrequency.Monthly:
      if (interval === 1) {
        parts.push(locale === 'zh' ? '每月' : 'Monthly');
      } else {
        parts.push(locale === 'zh' ? `每 ${interval} 月` : `Every ${interval} months`);
      }
      break;

    case RecurrenceFrequency.Yearly:
      if (interval === 1) {
        parts.push(locale === 'zh' ? '每年' : 'Yearly');
      } else {
        parts.push(locale === 'zh' ? `每 ${interval} 年` : `Every ${interval} years`);
      }
      break;
  }

  // 结束条件
  if (rule.count) {
    parts.push(locale === 'zh' ? `，共 ${rule.count} 次` : `, ${rule.count} times`);
  } else if (rule.until) {
    const dateStr = rule.until.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US');
    parts.push(locale === 'zh' ? `，直到 ${dateStr}` : `, until ${dateStr}`);
  }

  return parts.join('');
}

