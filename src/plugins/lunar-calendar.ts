/**
 * 农历日历插件 - 提供农历计算和节假日支持
 * @module lunar-calendar
 */

export interface LunarDate {
  /** 农历年 */
  year: number;
  /** 农历月 */
  month: number;
  /** 农历日 */
  day: number;
  /** 是否闰月 */
  isLeapMonth: boolean;
  /** 生肖 */
  zodiac: string;
  /** 天干地支纪年 */
  ganZhi: string;
  /** 节气 */
  solarTerm?: string;
  /** 节日 */
  festival?: string;
  /** 农历月份中文名 */
  monthChinese: string;
  /** 农历日期中文名 */
  dayChinese: string;
}

export interface Holiday {
  /** 节日名称 */
  name: string;
  /** 节日类型 */
  type: 'solar' | 'lunar' | 'custom';
  /** 日期（阳历或农历） */
  date: string;
  /** 是否放假 */
  isOffDay: boolean;
  /** 放假天数 */
  offDays?: number;
  /** 节日描述 */
  description?: string;
  /** 节日重要性（1-5） */
  importance?: number;
}

export interface LunarCalendarConfig {
  /** 是否显示节气 */
  showSolarTerms?: boolean;
  /** 是否显示节日 */
  showFestivals?: boolean;
  /** 自定义节日 */
  customHolidays?: Holiday[];
  /** 语言 */
  locale?: 'zh-CN' | 'zh-TW' | 'en-US';
}

export class LunarCalendar {
  private config: Required<LunarCalendarConfig>;

  // 农历数据（1900-2100年）
  private static readonly LUNAR_INFO = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
    0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252,
    0x0d520
  ];

  // 天干
  private static readonly TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

  // 地支
  private static readonly DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // 生肖
  private static readonly ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

  // 农历月份
  private static readonly LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];

  // 农历日期
  private static readonly LUNAR_DAYS = [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
  ];

  // 二十四节气
  private static readonly SOLAR_TERMS = [
    '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
    '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑',
    '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
  ];

  // 节气基准数据
  private static readonly TERM_INFO = [
    0, 21208, 42467, 63836, 85337, 107014, 128867, 150921,
    173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033,
    353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758
  ];

  // 中国传统节日
  private static readonly CHINESE_HOLIDAYS: Holiday[] = [
    // 阳历节日
    { name: '元旦', type: 'solar', date: '01-01', isOffDay: true, offDays: 1, importance: 5 },
    { name: '情人节', type: 'solar', date: '02-14', isOffDay: false, importance: 3 },
    { name: '妇女节', type: 'solar', date: '03-08', isOffDay: false, importance: 3 },
    { name: '植树节', type: 'solar', date: '03-12', isOffDay: false, importance: 2 },
    { name: '愚人节', type: 'solar', date: '04-01', isOffDay: false, importance: 2 },
    { name: '劳动节', type: 'solar', date: '05-01', isOffDay: true, offDays: 1, importance: 5 },
    { name: '青年节', type: 'solar', date: '05-04', isOffDay: false, importance: 3 },
    { name: '儿童节', type: 'solar', date: '06-01', isOffDay: false, importance: 3 },
    { name: '建党节', type: 'solar', date: '07-01', isOffDay: false, importance: 4 },
    { name: '建军节', type: 'solar', date: '08-01', isOffDay: false, importance: 4 },
    { name: '教师节', type: 'solar', date: '09-10', isOffDay: false, importance: 3 },
    { name: '国庆节', type: 'solar', date: '10-01', isOffDay: true, offDays: 3, importance: 5 },
    { name: '圣诞节', type: 'solar', date: '12-25', isOffDay: false, importance: 3 },

    // 农历节日
    { name: '春节', type: 'lunar', date: '01-01', isOffDay: true, offDays: 3, importance: 5 },
    { name: '元宵节', type: 'lunar', date: '01-15', isOffDay: false, importance: 4 },
    { name: '龙抬头', type: 'lunar', date: '02-02', isOffDay: false, importance: 2 },
    { name: '端午节', type: 'lunar', date: '05-05', isOffDay: true, offDays: 1, importance: 5 },
    { name: '七夕节', type: 'lunar', date: '07-07', isOffDay: false, importance: 3 },
    { name: '中元节', type: 'lunar', date: '07-15', isOffDay: false, importance: 2 },
    { name: '中秋节', type: 'lunar', date: '08-15', isOffDay: true, offDays: 1, importance: 5 },
    { name: '重阳节', type: 'lunar', date: '09-09', isOffDay: false, importance: 3 },
    { name: '腊八节', type: 'lunar', date: '12-08', isOffDay: false, importance: 2 },
    { name: '小年', type: 'lunar', date: '12-23', isOffDay: false, importance: 3 },
    { name: '除夕', type: 'lunar', date: '12-30', isOffDay: true, offDays: 1, importance: 5 },
  ];

  constructor(config: LunarCalendarConfig = {}) {
    this.config = {
      showSolarTerms: config.showSolarTerms !== false,
      showFestivals: config.showFestivals !== false,
      customHolidays: config.customHolidays || [],
      locale: config.locale || 'zh-CN',
    };
  }

  /**
   * 获取农历年的总天数
   */
  private getLunarYearDays(year: number): number {
    let sum = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) {
      sum += (LunarCalendar.LUNAR_INFO[year - 1900] & i) ? 1 : 0;
    }
    return sum + this.getLeapDays(year);
  }

  /**
   * 获取农历年闰月的天数
   */
  private getLeapDays(year: number): number {
    if (this.getLeapMonth(year)) {
      return (LunarCalendar.LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
    }
    return 0;
  }

  /**
   * 获取农历年闰哪个月
   */
  private getLeapMonth(year: number): number {
    return LunarCalendar.LUNAR_INFO[year - 1900] & 0xf;
  }

  /**
   * 获取农历年月的天数
   */
  private getMonthDays(year: number, month: number): number {
    if (month > 12 || month < 1) return -1;
    return (LunarCalendar.LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29;
  }

  /**
   * 阳历转农历
   */
  public solarToLunar(date: Date): LunarDate {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 计算与1900年1月31日相差的天数
    const baseDate = new Date(1900, 0, 31);
    const offset = Math.floor((date.getTime() - baseDate.getTime()) / 86400000);

    let lunarYear = 1900;
    let temp = 0;

    // 计算农历年
    while (lunarYear < 2100 && offset > 0) {
      temp = this.getLunarYearDays(lunarYear);
      if (offset < temp) break;
      offset -= temp;
      lunarYear++;
    }

    // 计算闰月
    const leap = this.getLeapMonth(lunarYear);
    let isLeap = false;

    // 计算农历月和日
    let lunarMonth = 1;
    for (let i = 1; i < 13 && offset > 0; i++) {
      // 闰月
      if (leap > 0 && i === leap + 1 && !isLeap) {
        --i;
        isLeap = true;
        temp = this.getLeapDays(lunarYear);
      } else {
        temp = this.getMonthDays(lunarYear, i);
      }

      // 解除闰月
      if (isLeap && i === leap + 1) isLeap = false;

      offset -= temp;
      if (offset <= 0) {
        lunarMonth = i;
        break;
      }
    }

    const lunarDay = offset + temp;

    // 计算生肖
    const zodiac = LunarCalendar.ZODIAC[(lunarYear - 4) % 12];

    // 计算干支
    const ganIndex = (lunarYear - 4) % 10;
    const zhiIndex = (lunarYear - 4) % 12;
    const ganZhi = LunarCalendar.TIAN_GAN[ganIndex] + LunarCalendar.DI_ZHI[zhiIndex];

    // 获取节气
    const solarTerm = this.getSolarTerm(year, month, day);

    // 获取节日
    const festival = this.getFestival(date, { year: lunarYear, month: lunarMonth, day: lunarDay, isLeapMonth: isLeap });

    return {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeapMonth: isLeap,
      zodiac,
      ganZhi,
      solarTerm,
      festival,
      monthChinese: (isLeap ? '闰' : '') + LunarCalendar.LUNAR_MONTHS[lunarMonth - 1] + '月',
      dayChinese: LunarCalendar.LUNAR_DAYS[lunarDay - 1],
    };
  }

  /**
   * 获取节气
   */
  private getSolarTerm(year: number, month: number, day: number): string | undefined {
    if (!this.config.showSolarTerms) return undefined;

    const termIndex = (month - 1) * 2;
    const termDay1 = this.getTermDay(year, termIndex);
    const termDay2 = this.getTermDay(year, termIndex + 1);

    if (day === termDay1) return LunarCalendar.SOLAR_TERMS[termIndex];
    if (day === termDay2) return LunarCalendar.SOLAR_TERMS[termIndex + 1];

    return undefined;
  }

  /**
   * 计算节气日期
   */
  private getTermDay(year: number, term: number): number {
    const century = Math.floor(year / 100);
    const y = year % 100;
    const termTime = LunarCalendar.TERM_INFO[term];
    const offset = Math.floor((y * 0.2422 + termTime / 10000 - Math.floor(y / 4)) + 0.5);
    return offset;
  }

  /**
   * 获取节日
   */
  private getFestival(solarDate: Date, lunarDate: { year: number; month: number; day: number; isLeapMonth: boolean }): string | undefined {
    if (!this.config.showFestivals) return undefined;

    const festivals: string[] = [];

    // 检查阳历节日
    const solarMonth = (solarDate.getMonth() + 1).toString().padStart(2, '0');
    const solarDay = solarDate.getDate().toString().padStart(2, '0');
    const solarKey = `${solarMonth}-${solarDay}`;

    // 检查农历节日
    const lunarMonth = lunarDate.month.toString().padStart(2, '0');
    const lunarDay = lunarDate.day.toString().padStart(2, '0');
    const lunarKey = `${lunarMonth}-${lunarDay}`;

    // 查找匹配的节日
    const allHolidays = [...LunarCalendar.CHINESE_HOLIDAYS, ...this.config.customHolidays];

    allHolidays.forEach(holiday => {
      if (holiday.type === 'solar' && holiday.date === solarKey) {
        festivals.push(holiday.name);
      } else if (holiday.type === 'lunar' && holiday.date === lunarKey && !lunarDate.isLeapMonth) {
        festivals.push(holiday.name);
      }
    });

    return festivals.length > 0 ? festivals.join('·') : undefined;
  }

  /**
   * 获取指定月份的所有节日
   */
  public getMonthHolidays(year: number, month: number): Map<number, Holiday[]> {
    const holidays = new Map<number, Holiday[]>();
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayHolidays = this.getDateHolidays(date);

      if (dayHolidays.length > 0) {
        holidays.set(day, dayHolidays);
      }
    }

    return holidays;
  }

  /**
   * 获取指定日期的节日
   */
  public getDateHolidays(date: Date): Holiday[] {
    const holidays: Holiday[] = [];
    const lunarDate = this.solarToLunar(date);

    // 阳历日期
    const solarMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    const solarDay = date.getDate().toString().padStart(2, '0');
    const solarKey = `${solarMonth}-${solarDay}`;

    // 农历日期
    const lunarMonth = lunarDate.month.toString().padStart(2, '0');
    const lunarDay = lunarDate.day.toString().padStart(2, '0');
    const lunarKey = `${lunarMonth}-${lunarDay}`;

    // 所有节日
    const allHolidays = [...LunarCalendar.CHINESE_HOLIDAYS, ...this.config.customHolidays];

    allHolidays.forEach(holiday => {
      if (
        (holiday.type === 'solar' && holiday.date === solarKey) ||
        (holiday.type === 'lunar' && holiday.date === lunarKey && !lunarDate.isLeapMonth)
      ) {
        holidays.push(holiday);
      }
    });

    // 按重要性排序
    holidays.sort((a, b) => (b.importance || 0) - (a.importance || 0));

    return holidays;
  }

  /**
   * 添加自定义节日
   */
  public addCustomHoliday(holiday: Holiday): void {
    this.config.customHolidays.push(holiday);
  }

  /**
   * 移除自定义节日
   */
  public removeCustomHoliday(name: string): boolean {
    const index = this.config.customHolidays.findIndex(h => h.name === name);
    if (index !== -1) {
      this.config.customHolidays.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 获取年度节日列表
   */
  public getYearHolidays(year: number): Array<{ date: Date; holiday: Holiday }> {
    const yearHolidays: Array<{ date: Date; holiday: Holiday }> = [];
    const allHolidays = [...LunarCalendar.CHINESE_HOLIDAYS, ...this.config.customHolidays];

    // 处理阳历节日
    allHolidays.filter(h => h.type === 'solar').forEach(holiday => {
      const [month, day] = holiday.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      yearHolidays.push({ date, holiday });
    });

    // 处理农历节日
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const lunarDate = this.solarToLunar(date);

        allHolidays.filter(h => h.type === 'lunar').forEach(holiday => {
          const [lunarMonth, lunarDay] = holiday.date.split('-').map(Number);
          if (lunarDate.month === lunarMonth && lunarDate.day === lunarDay && !lunarDate.isLeapMonth) {
            yearHolidays.push({ date, holiday });
          }
        });
      }
    }

    // 按日期排序
    yearHolidays.sort((a, b) => a.date.getTime() - b.date.getTime());

    return yearHolidays;
  }

  /**
   * 格式化农历日期
   */
  public formatLunarDate(lunarDate: LunarDate, format: string = 'full'): string {
    switch (format) {
      case 'full':
        return `${lunarDate.ganZhi}年 ${lunarDate.zodiac}年 ${lunarDate.monthChinese}${lunarDate.dayChinese}`;
      case 'month-day':
        return `${lunarDate.monthChinese}${lunarDate.dayChinese}`;
      case 'day':
        return lunarDate.dayChinese;
      default:
        return lunarDate.dayChinese;
    }
  }
}

/**
 * 创建农历日历实例
 */
export function createLunarCalendar(config?: LunarCalendarConfig): LunarCalendar {
  return new LunarCalendar(config);
}

