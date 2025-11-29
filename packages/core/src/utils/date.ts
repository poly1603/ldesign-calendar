/**
 * DateUtil - 日期工具类
 * 提供日期计算、格式化、解析等基础功能
 */

import {
  MILLISECONDS_IN_DAY,
  DAYS_IN_MONTH,
  DAYS_IN_WEEK,
  SUNDAY,
  MONDAY,
  DEFAULT_DATE_FORMAT,
} from './constants';

export class DateUtil {
  /**
   * 格式化日期
   * 支持的格式: YYYY, YY, MM, M, DD, D, HH, H, mm, m, ss, s, SSS
   */
  static format(date: Date, pattern: string = DEFAULT_DATE_FORMAT): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();

    const replacements: Record<string, string> = {
      'YYYY': String(year),
      'YY': String(year).slice(-2),
      'MM': String(month).padStart(2, '0'),
      'M': String(month),
      'DD': String(day).padStart(2, '0'),
      'D': String(day),
      'HH': String(hours).padStart(2, '0'),
      'H': String(hours),
      'mm': String(minutes).padStart(2, '0'),
      'm': String(minutes),
      'ss': String(seconds).padStart(2, '0'),
      's': String(seconds),
      'SSS': String(milliseconds).padStart(3, '0'),
    };

    let formatted = pattern;
    for (const [token, value] of Object.entries(replacements)) {
      formatted = formatted.replace(new RegExp(token, 'g'), value);
    }

    return formatted;
  }

  /**
   * 解析日期字符串
   */
  static parse(dateStr: string, pattern: string = DEFAULT_DATE_FORMAT): Date {
    // 简化版解析，支持常见格式
    const datePattern = pattern
      .replace('YYYY', '(\\d{4})')
      .replace('MM', '(\\d{2})')
      .replace('DD', '(\\d{2})')
      .replace('HH', '(\\d{2})')
      .replace('mm', '(\\d{2})')
      .replace('ss', '(\\d{2})');

    const regex = new RegExp(datePattern);
    const match = dateStr.match(regex);

    if (!match) {
      throw new Error(`Invalid date string: ${dateStr}`);
    }

    const tokens = pattern.match(/(YYYY|MM|DD|HH|mm|ss)/g) || [];
    const values: Record<string, number> = {};

    tokens.forEach((token, index) => {
      values[token] = parseInt(match[index + 1], 10);
    });

    return new Date(
      values.YYYY || 0,
      (values.MM || 1) - 1,
      values.DD || 1,
      values.HH || 0,
      values.mm || 0,
      values.ss || 0
    );
  }

  /**
   * 添加天数
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * 添加月份
   */
  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * 添加年份
   */
  static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * 获取某月的天数
   */
  static getDaysInMonth(year: number, month: number): number {
    // month 是 0-based (0 = January)
    if (month === 1) {
      // 二月，需要判断闰年
      return this.isLeapYear(year) ? 29 : 28;
    }
    return DAYS_IN_MONTH[month];
  }

  /**
   * 判断是否为闰年
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * 获取某个日期是一年中的第几周
   */
  static getWeekOfYear(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - firstDayOfYear.getTime()) / MILLISECONDS_IN_DAY);
    return Math.ceil((days + firstDayOfYear.getDay() + 1) / DAYS_IN_WEEK);
  }

  /**
   * 获取月初日期
   */
  static getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * 获取月末日期
   */
  static getEndOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  /**
   * 获取周初日期
   */
  static getStartOfWeek(date: Date, firstDayOfWeek: number = MONDAY): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = (day < firstDayOfWeek ? 7 : 0) + day - firstDayOfWeek;
    result.setDate(result.getDate() - diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * 获取周末日期
   */
  static getEndOfWeek(date: Date, firstDayOfWeek: number = MONDAY): Date {
    const start = this.getStartOfWeek(date, firstDayOfWeek);
    return this.addDays(start, 6);
  }

  /**
   * 获取日期的开始时间（00:00:00.000）
   */
  static getStartOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * 获取日期的结束时间（23:59:59.999）
   */
  static getEndOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * 判断两个日期是否是同一天
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * 判断两个日期是否是同一个月
   */
  static isSameMonth(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    );
  }

  /**
   * 判断两个日期是否是同一年
   */
  static isSameYear(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear();
  }

  /**
   * 判断是否是今天
   */
  static isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  /**
   * 判断日期是否在指定范围内
   */
  static isBetween(date: Date, start: Date, end: Date, inclusive: boolean = true): boolean {
    const time = date.getTime();
    const startTime = start.getTime();
    const endTime = end.getTime();

    if (inclusive) {
      return time >= startTime && time <= endTime;
    }
    return time > startTime && time < endTime;
  }

  /**
   * 判断 date1 是否在 date2 之前
   */
  static isBefore(date1: Date, date2: Date): boolean {
    return date1.getTime() < date2.getTime();
  }

  /**
   * 判断 date1 是否在 date2 之后
   */
  static isAfter(date1: Date, date2: Date): boolean {
    return date1.getTime() > date2.getTime();
  }

  /**
   * 判断是否是周末
   */
  static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === SUNDAY || day === 6; // 周日或周六
  }

  /**
   * 判断是否是工作日
   */
  static isWeekday(date: Date): boolean {
    return !this.isWeekend(date);
  }

  /**
   * 计算两个日期之间相差的天数
   */
  static diffInDays(date1: Date, date2: Date): number {
    const diff = date2.getTime() - date1.getTime();
    return Math.floor(diff / MILLISECONDS_IN_DAY);
  }

  /**
   * 计算两个日期之间相差的月数
   */
  static diffInMonths(date1: Date, date2: Date): number {
    const yearDiff = date2.getFullYear() - date1.getFullYear();
    const monthDiff = date2.getMonth() - date1.getMonth();
    return yearDiff * 12 + monthDiff;
  }

  /**
   * 计算两个日期之间相差的年数
   */
  static diffInYears(date1: Date, date2: Date): number {
    return date2.getFullYear() - date1.getFullYear();
  }

  /**
   * 克隆日期对象
   */
  static clone(date: Date): Date {
    return new Date(date.getTime());
  }

  /**
   * 获取日期的时间戳
   */
  static getTimestamp(date: Date): number {
    return date.getTime();
  }

  /**
   * 从时间戳创建日期
   */
  static fromTimestamp(timestamp: number): Date {
    return new Date(timestamp);
  }

  /**
   * 获取两个日期之间的所有日期
   */
  static getDatesBetween(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = this.clone(start);

    while (this.isBefore(current, end) || this.isSameDay(current, end)) {
      dates.push(this.clone(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * 获取某个月的所有日期
   */
  static getDatesInMonth(year: number, month: number): Date[] {
    const start = new Date(year, month, 1);
    const end = this.getEndOfMonth(start);
    return this.getDatesBetween(start, end);
  }

  /**
   * 设置日期的时间部分
   */
  static setTime(date: Date, hours: number, minutes: number = 0, seconds: number = 0, milliseconds: number = 0): Date {
    const result = this.clone(date);
    result.setHours(hours, minutes, seconds, milliseconds);
    return result;
  }

  /**
   * 获取日期的 ISO 字符串（YYYY-MM-DD）
   */
  static toISODate(date: Date): string {
    return this.format(date, 'YYYY-MM-DD');
  }

  /**
   * 从 ISO 日期字符串创建日期
   */
  static fromISODate(isoDate: string): Date {
    return this.parse(isoDate, 'YYYY-MM-DD');
  }

  /**
   * 获取本地化的日期字符串
   */
  static toLocaleDateString(date: Date, locale: string = 'zh-CN'): string {
    return date.toLocaleDateString(locale);
  }

  /**
   * 获取本地化的时间字符串
   */
  static toLocaleTimeString(date: Date, locale: string = 'zh-CN'): string {
    return date.toLocaleTimeString(locale);
  }

  /**
   * 比较两个日期的大小
   * 返回: -1 (date1 < date2), 0 (相等), 1 (date1 > date2)
   */
  static compare(date1: Date, date2: Date): number {
    const time1 = date1.getTime();
    const time2 = date2.getTime();
    
    if (time1 < time2) return -1;
    if (time1 > time2) return 1;
    return 0;
  }

  /**
   * 获取两个日期中较早的那个
   */
  static min(...dates: Date[]): Date {
    return new Date(Math.min(...dates.map(d => d.getTime())));
  }

  /**
   * 获取两个日期中较晚的那个
   */
  static max(...dates: Date[]): Date {
    return new Date(Math.max(...dates.map(d => d.getTime())));
  }
}