/**
 * HolidayManager - 节假日管理模块
 * 支持自定义节假日和预设节假日数据
 */

import type { Holiday } from '../types';
import { DateUtil } from '../utils/date';

export class HolidayManager {
  private holidays: Map<string, Holiday>;

  constructor() {
    this.holidays = new Map();
  }

  /**
   * 添加节假日
   */
  addHoliday(holiday: Holiday): void {
    this.holidays.set(holiday.date, holiday);
  }

  /**
   * 批量添加节假日
   */
  addHolidays(holidays: Holiday[]): void {
    holidays.forEach(holiday => this.addHoliday(holiday));
  }

  /**
   * 删除节假日
   */
  removeHoliday(date: string): void {
    this.holidays.delete(date);
  }

  /**
   * 批量删除节假日
   */
  removeHolidays(dates: string[]): void {
    dates.forEach(date => this.removeHoliday(date));
  }

  /**
   * 获取节假日
   */
  getHoliday(date: Date): Holiday | null {
    const dateStr = DateUtil.toISODate(date);
    return this.holidays.get(dateStr) || null;
  }

  /**
   * 判断是否为节假日
   */
  isHoliday(date: Date): boolean {
    return this.getHoliday(date) !== null;
  }

  /**
   * 判断是否为放假日
   */
  isOffDay(date: Date): boolean {
    const holiday = this.getHoliday(date);
    return holiday?.isOff === true;
  }

  /**
   * 获取某月的所有节假日
   */
  getHolidaysInMonth(year: number, month: number): Holiday[] {
    const dates = DateUtil.getDatesInMonth(year, month);
    const holidays: Holiday[] = [];

    dates.forEach(date => {
      const holiday = this.getHoliday(date);
      if (holiday) {
        holidays.push(holiday);
      }
    });

    return holidays;
  }

  /**
   * 获取某年的所有节假日
   */
  getHolidaysInYear(year: number): Holiday[] {
    const holidays: Holiday[] = [];

    for (let month = 0; month < 12; month++) {
      const monthHolidays = this.getHolidaysInMonth(year, month);
      holidays.push(...monthHolidays);
    }

    return holidays;
  }

  /**
   * 获取日期范围内的所有节假日
   */
  getHolidaysInRange(start: Date, end: Date): Holiday[] {
    const dates = DateUtil.getDatesBetween(start, end);
    const holidays: Holiday[] = [];

    dates.forEach(date => {
      const holiday = this.getHoliday(date);
      if (holiday) {
        holidays.push(holiday);
      }
    });

    return holidays;
  }

  /**
   * 获取所有节假日
   */
  getAllHolidays(): Holiday[] {
    return Array.from(this.holidays.values());
  }

  /**
   * 清除所有节假日
   */
  clearAllHolidays(): void {
    this.holidays.clear();
  }

  /**
   * 加载预设节假日（中国）
   */
  loadChinaHolidays(year: number): void {
    const holidays: Holiday[] = [
      // 元旦
      {
        date: `${year}-01-01`,
        name: '元旦',
        type: 'public',
        isOff: true,
        description: '新年第一天',
      },
      // 春节（示例，实际需要根据农历计算）
      {
        date: `${year}-02-10`,
        name: '春节',
        type: 'traditional',
        isOff: true,
        description: '农历新年',
      },
      {
        date: `${year}-02-11`,
        name: '春节',
        type: 'traditional',
        isOff: true,
      },
      {
        date: `${year}-02-12`,
        name: '春节',
        type: 'traditional',
        isOff: true,
      },
      // 清明节
      {
        date: `${year}-04-04`,
        name: '清明节',
        type: 'traditional',
        isOff: true,
        description: '祭祀先人',
      },
      // 劳动节
      {
        date: `${year}-05-01`,
        name: '劳动节',
        type: 'public',
        isOff: true,
        description: '国际劳动节',
      },
      // 端午节（示例，实际需要根据农历计算）
      {
        date: `${year}-06-10`,
        name: '端午节',
        type: 'traditional',
        isOff: true,
        description: '纪念屈原',
      },
      // 中秋节（示例，实际需要根据农历计算）
      {
        date: `${year}-09-15`,
        name: '中秋节',
        type: 'traditional',
        isOff: true,
        description: '团圆节',
      },
      // 国庆节
      {
        date: `${year}-10-01`,
        name: '国庆节',
        type: 'public',
        isOff: true,
        description: '中华人民共和国成立纪念日',
      },
      {
        date: `${year}-10-02`,
        name: '国庆节',
        type: 'public',
        isOff: true,
      },
      {
        date: `${year}-10-03`,
        name: '国庆节',
        type: 'public',
        isOff: true,
      },
    ];

    this.addHolidays(holidays);
  }

  /**
   * 加载预设节假日（美国）
   */
  loadUSAHolidays(year: number): void {
    const holidays: Holiday[] = [
      // New Year's Day
      {
        date: `${year}-01-01`,
        name: "New Year's Day",
        type: 'public',
        isOff: true,
        description: 'First day of the year',
      },
      // Independence Day
      {
        date: `${year}-07-04`,
        name: 'Independence Day',
        type: 'public',
        isOff: true,
        description: 'Celebration of US independence',
      },
      // Thanksgiving (Fourth Thursday of November)
      {
        date: `${year}-11-23`,
        name: 'Thanksgiving',
        type: 'public',
        isOff: true,
        description: 'Day of giving thanks',
      },
      // Christmas
      {
        date: `${year}-12-25`,
        name: 'Christmas',
        type: 'public',
        isOff: true,
        description: 'Celebration of the birth of Jesus Christ',
      },
    ];

    this.addHolidays(holidays);
  }

  /**
   * 加载预设节假日
   */
  loadPresetHolidays(country: string, year: number = new Date().getFullYear()): void {
    switch (country.toLowerCase()) {
      case 'china':
      case 'cn':
      case 'zh':
        this.loadChinaHolidays(year);
        break;
      case 'usa':
      case 'us':
        this.loadUSAHolidays(year);
        break;
      default:
        console.warn(`No preset holidays available for country: ${country}`);
    }
  }

  /**
   * 导出为 JSON
   */
  exportToJSON(): string {
    const holidays = this.getAllHolidays();
    return JSON.stringify(holidays, null, 2);
  }

  /**
   * 从 JSON 导入
   */
  importFromJSON(jsonData: string): void {
    try {
      const holidays = JSON.parse(jsonData) as Holiday[];
      this.addHolidays(holidays);
    } catch (error) {
      console.error('Failed to import holidays from JSON:', error);
      throw new Error('Invalid JSON data');
    }
  }

  /**
   * 克隆实例
   */
  clone(): HolidayManager {
    const cloned = new HolidayManager();
    this.holidays.forEach((holiday, date) => {
      cloned.addHoliday({ ...holiday });
    });
    return cloned;
  }
}