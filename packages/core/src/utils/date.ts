/**
 * @ldesign/calendar-core - 日期工具函数（优化版）
 * 添加缓存和性能优化
 */

import type { Weekday } from '../types';

// 日期计算结果缓存
const dateCache = new Map<string, Date>();
const MAX_CACHE_SIZE = 1000;

/**
 * 清理缓存（当缓存过大时）
 */
function cleanCache(): void {
  if (dateCache.size > MAX_CACHE_SIZE) {
    // 删除最旧的条目
    const firstKey = dateCache.keys().next().value;
    if (firstKey) {
      dateCache.delete(firstKey);
    }
  }
}

/**
 * 获取缓存的日期
 */
function getCachedDate(key: string, factory: () => Date): Date {
  if (dateCache.has(key)) {
    return new Date(dateCache.get(key)!);
  }

  const date = factory();
  cleanCache();
  dateCache.set(key, new Date(date));
  return date;
}

/**
 * 克隆日期
 */
export function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

/**
 * 获取一周的开始日期
 */
export function startOfWeek(date: Date, firstDayOfWeek: Weekday = 0): Date {
  const d = cloneDate(date);
  const day = d.getDay();
  const diff = (day < firstDayOfWeek ? 7 : 0) + day - firstDayOfWeek;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 获取一周的结束日期
 */
export function endOfWeek(date: Date, firstDayOfWeek: Weekday = 0): Date {
  const d = startOfWeek(date, firstDayOfWeek);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * 获取月份的开始日期
 */
export function startOfMonth(date: Date): Date {
  const d = cloneDate(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 获取月份的结束日期
 */
export function endOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * 获取一天的开始时间
 */
export function startOfDay(date: Date): Date {
  const d = cloneDate(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 获取一天的结束时间
 */
export function endOfDay(date: Date): Date {
  const d = cloneDate(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * 获取月份的天数
 */
export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * 获取月视图所需的所有日期（包含前后月份）
 * 使用缓存优化
 */
export function getMonthViewDates(date: Date, firstDayOfWeek: Weekday = 0): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const cacheKey = `month_${year}_${month}_${firstDayOfWeek}`;

  // 检查缓存
  const cached = dateCache.get(cacheKey);
  if (cached) {
    // 返回日期数组的副本
    return JSON.parse(cached.toString()).map((ts: number) => new Date(ts));
  }

  const dates: Date[] = [];
  const firstDayOfMonth = startOfMonth(date);

  // 从第一周的第一天开始
  const start = startOfWeek(firstDayOfMonth, firstDayOfWeek);

  // 获取6周的日期（42天）
  for (let i = 0; i < 42; i++) {
    const d = cloneDate(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }

  // 缓存时间戳数组
  cleanCache();
  dateCache.set(cacheKey, dates.map(d => d.getTime()) as any);

  return dates;
}

/**
 * 获取周视图所需的日期
 */
export function getWeekViewDates(date: Date, firstDayOfWeek: Weekday = 0): Date[] {
  const dates: Date[] = [];
  const start = startOfWeek(date, firstDayOfWeek);

  for (let i = 0; i < 7; i++) {
    const d = cloneDate(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }

  return dates;
}

/**
 * 添加天数
 */
export function addDays(date: Date, days: number): Date {
  const d = cloneDate(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * 添加周数
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * 添加月数
 */
export function addMonths(date: Date, months: number): Date {
  const d = cloneDate(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * 添加年数
 */
export function addYears(date: Date, years: number): Date {
  const d = cloneDate(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

/**
 * 添加小时
 */
export function addHours(date: Date, hours: number): Date {
  const d = cloneDate(date);
  d.setHours(d.getHours() + hours);
  return d;
}

/**
 * 添加分钟
 */
export function addMinutes(date: Date, minutes: number): Date {
  const d = cloneDate(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

/**
 * 判断是否是同一天（优化：使用时间戳比较）
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 判断是否是同一月
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
}

/**
 * 判断是否是今天
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * 判断是否是周末
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * 判断日期是否在范围内（优化：使用时间戳比较）
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const timestamp = date.getTime();
  return timestamp >= start.getTime() && timestamp <= end.getTime();
}

/**
 * 格式化日期
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化时间
 */
export function formatTime(date: Date, format: string = 'HH:mm'): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const hours12 = date.getHours() % 12 || 12;
  const ampm = date.getHours() < 12 ? 'AM' : 'PM';

  return format
    .replace('HH', hours)
    .replace('hh', String(hours12).padStart(2, '0'))
    .replace('mm', minutes)
    .replace('A', ampm);
}

/**
 * 解析日期字符串
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * 计算两个日期之间的天数差
 */
export function daysBetween(date1: Date, date2: Date): number {
  const d1 = startOfDay(date1);
  const d2 = startOfDay(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 计算两个日期之间的分钟差
 */
export function minutesBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60));
}

/**
 * 将时间舍入到最近的间隔
 */
export function roundToInterval(date: Date, intervalMinutes: number): Date {
  const ms = 1000 * 60 * intervalMinutes;
  return new Date(Math.round(date.getTime() / ms) * ms);
}

/**
 * 获取一天中的小时数组
 */
export function getHoursInDay(start: number = 0, end: number = 24): number[] {
  const hours: number[] = [];
  for (let i = start; i < end; i++) {
    hours.push(i);
  }
  return hours;
}

/**
 * 比较两个日期（优化：直接比较时间戳）
 */
export function compareDate(date1: Date, date2: Date): number {
  return date1.getTime() - date2.getTime();
}

/**
 * 获取月份名称
 */
export function getMonthName(date: Date, locale: string = 'zh-CN'): string {
  return date.toLocaleDateString(locale, { month: 'long' });
}

/**
 * 获取星期名称
 */
export function getWeekdayName(
  date: Date,
  locale: string = 'zh-CN',
  format: 'short' | 'long' = 'long'
): string {
  return date.toLocaleDateString(locale, { weekday: format });
}

/**
 * 获取年月日
 */
export function getYearMonthDay(date: Date): { year: number; month: number; day: number } {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
}

/**
 * 从年月日创建日期
 */
export function createDate(year: number, month: number, day: number): Date {
  return new Date(year, month, day);
}

/**
 * 添加时长（分钟）
 */
export function addDuration(date: Date, durationMinutes: number): Date {
  return addMinutes(date, durationMinutes);
}

/**
 * 计算时长（分钟）
 */
export function getDuration(start: Date, end: Date): number {
  return minutesBetween(start, end);
}

/**
 * 清除日期缓存（用于测试或内存管理）
 */
export function clearDateCache(): void {
  dateCache.clear();
}

