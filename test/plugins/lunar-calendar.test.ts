/**
 * 农历日历插件测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LunarCalendar, createLunarCalendar } from '../../src/plugins/lunar-calendar';
import type { Holiday } from '../../src/plugins/lunar-calendar';

describe('LunarCalendar', () => {
  let lunar: LunarCalendar;

  beforeEach(() => {
    lunar = new LunarCalendar();
  });

  describe('阳历转农历', () => {
    it('应该正确转换普通日期', () => {
      const date = new Date('2024-01-15');
      const lunarDate = lunar.solarToLunar(date);
      
      expect(lunarDate.year).toBe(2023); // 农历年
      expect(lunarDate.month).toBe(12); // 腊月
      expect(lunarDate.day).toBe(5); // 初五
      expect(lunarDate.monthChinese).toBe('腊月');
      expect(lunarDate.dayChinese).toBe('初五');
      expect(lunarDate.zodiac).toBe('兔');
      expect(lunarDate.ganZhi).toContain('癸卯');
    });

    it('应该正确处理春节', () => {
      const date = new Date('2024-02-10'); // 2024年春节
      const lunarDate = lunar.solarToLunar(date);
      
      expect(lunarDate.year).toBe(2024);
      expect(lunarDate.month).toBe(1);
      expect(lunarDate.day).toBe(1);
      expect(lunarDate.monthChinese).toBe('正月');
      expect(lunarDate.dayChinese).toBe('初一');
      expect(lunarDate.zodiac).toBe('龙');
      expect(lunarDate.festival).toContain('春节');
    });

    it('应该正确识别中秋节', () => {
      const date = new Date('2024-09-17'); // 2024年中秋节
      const lunarDate = lunar.solarToLunar(date);
      
      expect(lunarDate.month).toBe(8);
      expect(lunarDate.day).toBe(15);
      expect(lunarDate.festival).toContain('中秋节');
    });

    it('应该正确处理闰月', () => {
      // 2023年有闰二月
      const date = new Date('2023-03-22'); // 闰二月初一
      const lunarDate = lunar.solarToLunar(date);
      
      expect(lunarDate.isLeapMonth).toBe(true);
      expect(lunarDate.month).toBe(2);
      expect(lunarDate.monthChinese).toContain('闰');
    });
  });

  describe('节气计算', () => {
    it('应该识别立春', () => {
      const date = new Date('2024-02-04'); // 立春
      const lunarDate = lunar.solarToLunar(date);
      
      expect(lunarDate.solarTerm).toBe('立春');
    });

    it('应该识别冬至', () => {
      const date = new Date('2024-12-21'); // 冬至
      const lunarDate = lunar.solarToLunar(date);
      
      expect(lunarDate.solarTerm).toBe('冬至');
    });

    it('非节气日期应返回undefined', () => {
      const date = new Date('2024-01-10');
      const lunarDate = lunar.solarToLunar(date);
      
      expect(lunarDate.solarTerm).toBeUndefined();
    });

    it('应该根据配置控制节气显示', () => {
      const lunarNoTerms = new LunarCalendar({
        showSolarTerms: false,
      });
      
      const date = new Date('2024-02-04'); // 立春
      const lunarDate = lunarNoTerms.solarToLunar(date);
      
      expect(lunarDate.solarTerm).toBeUndefined();
    });
  });

  describe('节日识别', () => {
    it('应该识别阳历节日', () => {
      const date = new Date('2024-01-01'); // 元旦
      const lunarDate = lunar.solarToLunar(date);
      
      expect(lunarDate.festival).toContain('元旦');
    });

    it('应该识别农历节日', () => {
      const date = new Date('2024-02-24'); // 元宵节（正月十五）
      const lunarDate = lunar.solarToLunar(date);
      
      expect(lunarDate.festival).toContain('元宵节');
    });

    it('应该识别多个节日', () => {
      // 如果某天同时是多个节日
      const holidays = lunar.getDateHolidays(new Date('2024-10-01'));
      
      expect(holidays.length).toBeGreaterThan(0);
      expect(holidays.some(h => h.name === '国庆节')).toBe(true);
    });

    it('应该根据配置控制节日显示', () => {
      const lunarNoFestivals = new LunarCalendar({
        showFestivals: false,
      });
      
      const date = new Date('2024-01-01');
      const lunarDate = lunarNoFestivals.solarToLunar(date);
      
      expect(lunarDate.festival).toBeUndefined();
    });
  });

  describe('自定义节日', () => {
    it('应该添加自定义节日', () => {
      const customHoliday: Holiday = {
        name: '公司成立日',
        type: 'solar',
        date: '03-15',
        isOffDay: true,
        importance: 5,
      };
      
      lunar.addCustomHoliday(customHoliday);
      
      const holidays = lunar.getDateHolidays(new Date('2024-03-15'));
      expect(holidays.some(h => h.name === '公司成立日')).toBe(true);
    });

    it('应该移除自定义节日', () => {
      const customHoliday: Holiday = {
        name: '测试节日',
        type: 'solar',
        date: '04-01',
        isOffDay: false,
        importance: 1,
      };
      
      lunar.addCustomHoliday(customHoliday);
      let holidays = lunar.getDateHolidays(new Date('2024-04-01'));
      expect(holidays.some(h => h.name === '测试节日')).toBe(true);
      
      lunar.removeCustomHoliday('测试节日');
      holidays = lunar.getDateHolidays(new Date('2024-04-01'));
      expect(holidays.some(h => h.name === '测试节日')).toBe(false);
    });
  });

  describe('月份节日', () => {
    it('应该获取指定月份的所有节日', () => {
      const holidays = lunar.getMonthHolidays(2024, 2); // 2024年2月
      
      expect(holidays.size).toBeGreaterThan(0);
      
      // 应该包含春节和情人节
      let hasSpringFestival = false;
      let hasValentinesDay = false;
      
      holidays.forEach((dayHolidays, day) => {
        dayHolidays.forEach(holiday => {
          if (holiday.name === '春节') hasSpringFestival = true;
          if (holiday.name === '情人节') hasValentinesDay = true;
        });
      });
      
      expect(hasSpringFestival).toBe(true);
      expect(hasValentinesDay).toBe(true);
    });
  });

  describe('年度节日', () => {
    it('应该获取年度节日列表', () => {
      const yearHolidays = lunar.getYearHolidays(2024);
      
      expect(yearHolidays.length).toBeGreaterThan(0);
      
      // 验证按日期排序
      for (let i = 1; i < yearHolidays.length; i++) {
        expect(yearHolidays[i].date.getTime()).toBeGreaterThanOrEqual(
          yearHolidays[i - 1].date.getTime()
        );
      }
      
      // 验证包含主要节日
      const holidayNames = yearHolidays.map(h => h.holiday.name);
      expect(holidayNames).toContain('元旦');
      expect(holidayNames).toContain('春节');
      expect(holidayNames).toContain('国庆节');
    });
  });

  describe('格式化', () => {
    it('应该正确格式化完整农历日期', () => {
      const date = new Date('2024-01-15');
      const lunarDate = lunar.solarToLunar(date);
      const formatted = lunar.formatLunarDate(lunarDate, 'full');
      
      expect(formatted).toContain('癸卯年');
      expect(formatted).toContain('兔年');
      expect(formatted).toContain('腊月初五');
    });

    it('应该正确格式化月日', () => {
      const date = new Date('2024-01-15');
      const lunarDate = lunar.solarToLunar(date);
      const formatted = lunar.formatLunarDate(lunarDate, 'month-day');
      
      expect(formatted).toBe('腊月初五');
    });

    it('应该正确格式化日期', () => {
      const date = new Date('2024-01-15');
      const lunarDate = lunar.solarToLunar(date);
      const formatted = lunar.formatLunarDate(lunarDate, 'day');
      
      expect(formatted).toBe('初五');
    });
  });

  describe('边界情况', () => {
    it('应该处理1900年的日期', () => {
      const date = new Date('1900-02-01');
      const lunarDate = lunar.solarToLunar(date);
      
      expect(lunarDate.year).toBe(1900);
      expect(lunarDate.month).toBeGreaterThan(0);
      expect(lunarDate.day).toBeGreaterThan(0);
    });

    it('应该处理2099年的日期', () => {
      const date = new Date('2099-12-31');
      const lunarDate = lunar.solarToLunar(date);
      
      expect(lunarDate.year).toBe(2099);
      expect(lunarDate.month).toBeGreaterThan(0);
      expect(lunarDate.day).toBeGreaterThan(0);
    });

    it('应该正确处理月末日期', () => {
      const date = new Date('2024-01-31');
      const lunarDate = lunar.solarToLunar(date);
      
      expect(lunarDate.day).toBeGreaterThan(0);
      expect(lunarDate.day).toBeLessThanOrEqual(30);
    });
  });

  describe('工厂函数', () => {
    it('应该通过工厂函数创建实例', () => {
      const instance = createLunarCalendar({
        showSolarTerms: true,
        showFestivals: true,
        locale: 'zh-CN',
      });
      
      const date = new Date('2024-02-10');
      const lunarDate = instance.solarToLunar(date);
      
      expect(lunarDate.festival).toContain('春节');
    });
  });
});
