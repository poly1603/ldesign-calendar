/**
 * LunarCalendar - 农历计算模块
 * 支持公历农历互转、节气计算、天干地支等
 */

import type { LunarDate } from '../types';
import { DateUtil } from './date';
import {
  LUNAR_INFO,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ZODIAC_ANIMALS,
  LUNAR_MONTHS,
  LUNAR_DAYS,
  SOLAR_TERMS,
} from './constants';

// 农历计算的基准年份
const LUNAR_BASE_YEAR = 1900;
const LUNAR_BASE_DATE = new Date(1900, 0, 31); // 1900年1月31日是农历1900年正月初一

export class LunarCalendar {
  /**
   * 公历转农历
   */
  static solarToLunar(date: Date): LunarDate {
    const baseDate = new Date(LUNAR_BASE_DATE);
    let offset = DateUtil.diffInDays(baseDate, date);

    let lunarYear = LUNAR_BASE_YEAR;
    let lunarMonth = 1;
    let lunarDay = 1;
    let isLeapMonth = false;

    let daysInYear = 0;
    let i = 0;

    // 计算农历年
    for (i = LUNAR_BASE_YEAR; i < 2100 && offset > 0; i++) {
      daysInYear = this.getDaysInLunarYear(i);
      if (offset < daysInYear) {
        lunarYear = i;
        break;
      }
      offset -= daysInYear;
    }

    // 计算农历月
    let daysInMonth = 0;
    const leapMonth = this.getLeapMonth(lunarYear);
    let isLeap = false;

    for (i = 1; i < 13 && offset > 0; i++) {
      // 闰月
      if (leapMonth > 0 && i === leapMonth + 1 && !isLeap) {
        --i;
        isLeap = true;
        daysInMonth = this.getLeapDays(lunarYear);
      } else {
        daysInMonth = this.getDaysInLunarMonth(lunarYear, i);
      }

      // 已经是闰月
      if (isLeap && i === leapMonth + 1) {
        isLeap = false;
        isLeapMonth = true;
      }

      offset -= daysInMonth;

      if (offset <= 0) {
        break;
      }

      lunarMonth = i + 1;
    }

    // 计算农历日
    if (offset === 0 && leapMonth > 0 && lunarMonth === leapMonth + 1) {
      if (isLeapMonth) {
        isLeapMonth = false;
      } else {
        isLeapMonth = true;
        --lunarMonth;
      }
    }

    if (offset < 0) {
      offset += daysInMonth;
      --lunarMonth;
    }

    lunarDay = offset + 1;

    // 获取中文表示
    const yearChinese = this.getGanZhi(lunarYear);
    const monthChinese = (isLeapMonth ? '闰' : '') + LUNAR_MONTHS[lunarMonth - 1] + '月';
    const dayChinese = LUNAR_DAYS[lunarDay - 1];
    const zodiac = this.getZodiac(lunarYear);
    const solarTerm = this.getSolarTerm(date);

    return {
      lunarYear,
      lunarMonth,
      lunarDay,
      isLeapMonth,
      yearChinese,
      monthChinese,
      dayChinese,
      zodiac,
      solarTerm: solarTerm || undefined,
    };
  }

  /**
   * 农历转公历
   */
  static lunarToSolar(year: number, month: number, day: number, isLeapMonth: boolean = false): Date {
    if (year < 1900 || year > 2100) {
      throw new Error('Year must be between 1900 and 2100');
    }

    const leapMonth = this.getLeapMonth(year);
    
    if (isLeapMonth && month !== leapMonth) {
      throw new Error('Invalid leap month');
    }

    let offset = 0;

    // 计算从1900年到指定年的天数
    for (let i = LUNAR_BASE_YEAR; i < year; i++) {
      offset += this.getDaysInLunarYear(i);
    }

    // 计算从正月到指定月的天数
    for (let i = 1; i < month; i++) {
      offset += this.getDaysInLunarMonth(year, i);
    }

    // 如果是闰月，需要加上闰月的天数
    if (isLeapMonth) {
      offset += this.getDaysInLunarMonth(year, month);
    }

    // 加上指定的天数
    offset += day - 1;

    // 从基准日期开始计算
    return DateUtil.addDays(LUNAR_BASE_DATE, offset);
  }

  /**
   * 获取农历年的总天数
   */
  static getDaysInLunarYear(year: number): number {
    let sum = 348; // 12个月，每月29天

    for (let i = 0x8000; i > 0x8; i >>= 1) {
      if (LUNAR_INFO[year - LUNAR_BASE_YEAR] & i) {
        sum += 1;
      }
    }

    return sum + this.getLeapDays(year);
  }

  /**
   * 获取农历某月的天数
   */
  static getDaysInLunarMonth(year: number, month: number): number {
    if (month > 12 || month < 1) {
      return 0;
    }

    return LUNAR_INFO[year - LUNAR_BASE_YEAR] & (0x10000 >> month) ? 30 : 29;
  }

  /**
   * 获取农历年的闰月月份，0表示无闰月
   */
  static getLeapMonth(year: number): number {
    return LUNAR_INFO[year - LUNAR_BASE_YEAR] & 0xf;
  }

  /**
   * 获取农历年闰月的天数
   */
  static getLeapDays(year: number): number {
    if (this.getLeapMonth(year)) {
      return LUNAR_INFO[year - LUNAR_BASE_YEAR] & 0x10000 ? 30 : 29;
    }
    return 0;
  }

  /**
   * 获取生肖
   */
  static getZodiac(year: number): string {
    return ZODIAC_ANIMALS[(year - 4) % 12];
  }

  /**
   * 获取天干地支纪年
   */
  static getGanZhi(year: number): string {
    const ganIndex = (year - 4) % 10;
    const zhiIndex = (year - 4) % 12;
    return HEAVENLY_STEMS[ganIndex] + EARTHLY_BRANCHES[zhiIndex];
  }

  /**
   * 获取节气
   * 使用寿星天文历算法简化版
   */
  static getSolarTerm(date: Date): string | null {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // 简化的节气计算，每个月两个节气
    const termIndex = month * 2;
    
    // 粗略计算节气日期（实际应该使用更精确的天文算法）
    const term1Day = this.getSolarTermDay(year, termIndex);
    const term2Day = this.getSolarTermDay(year, termIndex + 1);

    if (day === Math.floor(term1Day)) {
      return SOLAR_TERMS[termIndex];
    }
    if (day === Math.floor(term2Day)) {
      return SOLAR_TERMS[termIndex + 1];
    }

    return null;
  }

  /**
   * 计算节气日期（简化版）
   */
  private static getSolarTermDay(year: number, termIndex: number): number {
    // 这是一个简化的计算方法
    // 实际的节气计算需要使用天文算法，这里仅作示例
    const baseTermDays = [
      6, 20, // 一月：小寒、大寒
      4, 19, // 二月：立春、雨水
      6, 21, // 三月：惊蛰、春分
      5, 20, // 四月：清明、谷雨
      6, 21, // 五月：立夏、小满
      6, 22, // 六月：芒种、夏至
      7, 23, // 七月：小暑、大暑
      8, 23, // 八月：立秋、处暑
      8, 23, // 九月：白露、秋分
      8, 24, // 十月：寒露、霜降
      8, 22, // 十一月：立冬、小雪
      7, 22, // 十二月：大雪、冬至
    ];

    return baseTermDays[termIndex];
  }

  /**
   * 获取传统节日
   */
  static getTraditionalFestival(lunarDate: LunarDate): string | null {
    const { lunarMonth, lunarDay, isLeapMonth } = lunarDate;

    // 闰月不计算节日
    if (isLeapMonth) {
      return null;
    }

    const festivals: Record<string, string> = {
      '1-1': '春节',
      '1-15': '元宵节',
      '2-2': '龙抬头',
      '5-5': '端午节',
      '7-7': '七夕节',
      '7-15': '中元节',
      '8-15': '中秋节',
      '9-9': '重阳节',
      '12-8': '腊八节',
      '12-23': '小年',
    };

    const key = `${lunarMonth}-${lunarDay}`;
    return festivals[key] || null;
  }

  /**
   * 判断是否为农历节日
   */
  static isLunarFestival(lunarDate: LunarDate): boolean {
    return this.getTraditionalFestival(lunarDate) !== null;
  }

  /**
   * 获取农历月份的中文名称
   */
  static getLunarMonthName(month: number, isLeapMonth: boolean = false): string {
    if (month < 1 || month > 12) {
      return '';
    }
    return (isLeapMonth ? '闰' : '') + LUNAR_MONTHS[month - 1] + '月';
  }

  /**
   * 获取农历日期的中文名称
   */
  static getLunarDayName(day: number): string {
    if (day < 1 || day > 30) {
      return '';
    }
    return LUNAR_DAYS[day - 1];
  }

  /**
   * 格式化农历日期
   */
  static formatLunarDate(lunarDate: LunarDate, format: 'full' | 'short' = 'full'): string {
    const { yearChinese, monthChinese, dayChinese, zodiac } = lunarDate;

    if (format === 'short') {
      return `${monthChinese}${dayChinese}`;
    }

    return `${yearChinese}年${zodiac}年 ${monthChinese}${dayChinese}`;
  }
}