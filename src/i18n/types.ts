/**
 * @ldesign/calendar - 国际化类型定义
 */

/**
 * 日期格式选项
 */
export interface DateFormatOptions {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  weekday?: 'long' | 'short' | 'narrow';
}

/**
 * 时间格式选项
 */
export interface TimeFormatOptions {
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  hour12?: boolean;
}

/**
 * 语言包接口
 */
export interface Locale {
  /** 语言代码 */
  code: string;
  /** 语言名称 */
  name: string;
  /** 方向 */
  direction: 'ltr' | 'rtl';
  /** 一周的第一天（0=周日, 1=周一） */
  firstDayOfWeek: number;

  /** 月份名称（完整） */
  months: string[];
  /** 月份名称（缩写） */
  monthsShort: string[];
  /** 星期名称（完整） */
  weekdays: string[];
  /** 星期名称（缩写） */
  weekdaysShort: string[];
  /** 星期名称（最短） */
  weekdaysMin: string[];

  /** 日期格式 */
  dateFormats: {
    short: DateFormatOptions;
    long: DateFormatOptions;
    full: DateFormatOptions;
  };

  /** 时间格式 */
  timeFormats: {
    short: TimeFormatOptions;
    long: TimeFormatOptions;
  };

  /** UI 文本 */
  ui: {
    today: string;
    month: string;
    week: string;
    day: string;
    agenda: string;
    noEvents: string;
    allDay: string;
    createEvent: string;
    editEvent: string;
    deleteEvent: string;
    saveEvent: string;
    cancelEdit: string;
    eventTitle: string;
    eventDescription: string;
    eventLocation: string;
    eventStart: string;
    eventEnd: string;
    moreEvents: string;
    loading: string;
    error: string;
    previousMonth: string;
    nextMonth: string;
    previousWeek: string;
    nextWeek: string;
    previousDay: string;
    nextDay: string;
  };

  /** 提示信息 */
  messages: {
    confirmDelete: string;
    eventCreated: string;
    eventUpdated: string;
    eventDeleted: string;
    errorSaving: string;
    errorDeleting: string;
    errorLoading: string;
    invalidDate: string;
    invalidTimeRange: string;
  };

  /** 重复事件文本 */
  recurrence: {
    daily: string;
    weekly: string;
    monthly: string;
    yearly: string;
    repeat: string;
    every: string;
    days: string;
    weeks: string;
    months: string;
    years: string;
    on: string;
    until: string;
    count: string;
    occurrences: string;
    weekdays: {
      sunday: string;
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
    };
  };
}

/**
 * 国际化配置
 */
export interface I18nConfig {
  /** 当前语言 */
  locale?: string;
  /** 回退语言 */
  fallbackLocale?: string;
  /** 自定义语言包 */
  messages?: Record<string, Locale>;
}
