/**
 * @ldesign/calendar-core - 鏃ユ湡宸ュ叿鍑芥暟锛堜紭鍖栫増锛? * 娣诲姞缂撳瓨鍜屾€ц兘浼樺寲
 */

import type { Weekday } from '../types';

// 鏃ユ湡璁＄畻缁撴灉缂撳瓨
const dateCache = new Map<string, Date>();
const MAX_CACHE_SIZE = 1000;

/**
 * 娓呯悊缂撳瓨锛堝綋缂撳瓨杩囧ぇ鏃讹級
 */
function cleanCache(): void {
  if (dateCache.size > MAX_CACHE_SIZE) {
    // 鍒犻櫎鏈€鏃х殑鏉＄洰
    const firstKey = dateCache.keys().next().value;
    if (firstKey) {
      dateCache.delete(firstKey);
    }
  }
}

/**
 * 鑾峰彇缂撳瓨鐨勬棩鏈? */
export function getCachedDate(key: string, factory: () => Date): Date {
  if (dateCache.has(key)) {
    return new Date(dateCache.get(key)!);
  }

  const date = factory();
  cleanCache();
  dateCache.set(key, new Date(date));
  return date;
}

/**
 * 鍏嬮殕鏃ユ湡
 */
export function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

/**
 * 鑾峰彇涓€鍛ㄧ殑寮€濮嬫棩鏈? */
export function startOfWeek(date: Date, firstDayOfWeek: Weekday = 0): Date {
  const d = cloneDate(date);
  const day = d.getDay();
  const diff = (day < firstDayOfWeek ? 7 : 0) + day - firstDayOfWeek;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 鑾峰彇涓€鍛ㄧ殑缁撴潫鏃ユ湡
 */
export function endOfWeek(date: Date, firstDayOfWeek: Weekday = 0): Date {
  const d = startOfWeek(date, firstDayOfWeek);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * 鑾峰彇鏈堜唤鐨勫紑濮嬫棩鏈? */
export function startOfMonth(date: Date): Date {
  const d = cloneDate(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 鑾峰彇鏈堜唤鐨勭粨鏉熸棩鏈? */
export function endOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * 鑾峰彇涓€澶╃殑寮€濮嬫椂闂? */
export function startOfDay(date: Date): Date {
  const d = cloneDate(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 鑾峰彇涓€澶╃殑缁撴潫鏃堕棿
 */
export function endOfDay(date: Date): Date {
  const d = cloneDate(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * 鑾峰彇鏈堜唤鐨勫ぉ鏁? */
export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * 鑾峰彇鏈堣鍥炬墍闇€鐨勬墍鏈夋棩鏈燂紙鍖呭惈鍓嶅悗鏈堜唤锛? * 浣跨敤缂撳瓨浼樺寲
 */
export function getMonthViewDates(date: Date, firstDayOfWeek: Weekday = 0): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const cacheKey = `month_${year}_${month}_${firstDayOfWeek}`;

  // Check cache
  const cachedValue = dateCache.get(cacheKey);
  if (cachedValue) {
    // Return a copy of the date array
    return JSON.parse(cachedValue.toString()).map((ts: number) => new Date(ts));
  }

  const dates: Date[] = [];
  const firstDayOfMonth = startOfMonth(date);

  // Start from the first day of the first week
  const startDate = startOfWeek(firstDayOfMonth, firstDayOfWeek);

  // Get 6 weeks of dates (42 days)
  for (let i = 0; i < 42; i++) {
    const d = cloneDate(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push(d);
  }

  // 缂撳瓨鏃堕棿鎴虫暟缁?  cleanCache();
  dateCache.set(cacheKey, dates.map(d => d.getTime()) as any);

  return dates;
}

/**
 * 鑾峰彇鍛ㄨ鍥炬墍闇€鐨勬棩鏈? */
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
 * 娣诲姞澶╂暟
 */
export function addDays(date: Date, days: number): Date {
  const d = cloneDate(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * 娣诲姞鍛ㄦ暟
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * 娣诲姞鏈堟暟
 */
export function addMonths(date: Date, months: number): Date {
  const d = cloneDate(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * 娣诲姞骞存暟
 */
export function addYears(date: Date, years: number): Date {
  const d = cloneDate(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

/**
 * 娣诲姞灏忔椂
 */
export function addHours(date: Date, hours: number): Date {
  const d = cloneDate(date);
  d.setHours(d.getHours() + hours);
  return d;
}

/**
 * 娣诲姞鍒嗛挓
 */
export function addMinutes(date: Date, minutes: number): Date {
  const d = cloneDate(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

/**
 * 鍒ゆ柇鏄惁鏄悓涓€澶╋紙浼樺寲锛氫娇鐢ㄦ椂闂存埑姣旇緝锛? */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 鍒ゆ柇鏄惁鏄悓涓€鏈? */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
}

/**
 * 鍒ゆ柇鏄惁鏄粖澶? */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * 鍒ゆ柇鏄惁鏄懆鏈? */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * 鍒ゆ柇鏃ユ湡鏄惁鍦ㄨ寖鍥村唴锛堜紭鍖栵細浣跨敤鏃堕棿鎴虫瘮杈冿級
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const timestamp = date.getTime();
  return timestamp >= start.getTime() && timestamp <= end.getTime();
}

/**
 * 鏍煎紡鍖栨棩鏈? */
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
 * 鏍煎紡鍖栨椂闂? */
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
 * 瑙ｆ瀽鏃ユ湡瀛楃涓? */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * 璁＄畻涓や釜鏃ユ湡涔嬮棿鐨勫ぉ鏁板樊
 */
export function daysBetween(date1: Date, date2: Date): number {
  const d1 = startOfDay(date1);
  const d2 = startOfDay(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 璁＄畻涓や釜鏃ユ湡涔嬮棿鐨勫垎閽熷樊
 */
export function minutesBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60));
}

/**
 * 灏嗘椂闂磋垗鍏ュ埌鏈€杩戠殑闂撮殧
 */
export function roundToInterval(date: Date, intervalMinutes: number): Date {
  const ms = 1000 * 60 * intervalMinutes;
  return new Date(Math.round(date.getTime() / ms) * ms);
}

/**
 * 鑾峰彇涓€澶╀腑鐨勫皬鏃舵暟缁? */
export function getHoursInDay(start: number = 0, end: number = 24): number[] {
  const hours: number[] = [];
  for (let i = start; i < end; i++) {
    hours.push(i);
  }
  return hours;
}

/**
 * 姣旇緝涓や釜鏃ユ湡锛堜紭鍖栵細鐩存帴姣旇緝鏃堕棿鎴筹級
 */
export function compareDate(date1: Date, date2: Date): number {
  return date1.getTime() - date2.getTime();
}

/**
 * 鑾峰彇鏈堜唤鍚嶇О
 */
export function getMonthName(date: Date, locale: string = 'zh-CN'): string {
  return date.toLocaleDateString(locale, { month: 'long' });
}

/**
 * 鑾峰彇鏄熸湡鍚嶇О
 */
export function getWeekdayName(
  date: Date,
  locale: string = 'zh-CN',
  format: 'short' | 'long' = 'long'
): string {
  return date.toLocaleDateString(locale, { weekday: format });
}

/**
 * 鑾峰彇骞存湀鏃? */
export function getYearMonthDay(date: Date): { year: number; month: number; day: number } {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
}

/**
 * 浠庡勾鏈堟棩鍒涘缓鏃ユ湡
 */
export function createDate(year: number, month: number, day: number): Date {
  return new Date(year, month, day);
}

/**
 * 娣诲姞鏃堕暱锛堝垎閽燂級
 */
export function addDuration(date: Date, durationMinutes: number): Date {
  return addMinutes(date, durationMinutes);
}

/**
 * 璁＄畻鏃堕暱锛堝垎閽燂級
 */
export function getDuration(start: Date, end: Date): number {
  return minutesBetween(start, end);
}

/**
 * 娓呴櫎鏃ユ湡缂撳瓨锛堢敤浜庢祴璇曟垨鍐呭瓨绠＄悊锛? */
export function clearDateCache(): void {
  dateCache.clear();
}


