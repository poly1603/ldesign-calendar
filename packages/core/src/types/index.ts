/**
 * 日历插件核心类型定义
 */

// ============================================================================
// 基础类型
// ============================================================================

export type ViewMode = 'month' | 'week' | 'day';
export type Locale = 'zh-CN' | 'zh-TW' | 'en-US' | 'ja-JP' | string;

// ============================================================================
// 日历配置
// ============================================================================

export interface CalendarOptions {
  defaultDate?: Date;
  viewMode?: ViewMode;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledWeekdays?: number[];
  showWeekNumber?: boolean;
  showLunar?: boolean;
  firstDayOfWeek?: 0 | 1; // 0=Sunday, 1=Monday
  locale?: Locale;
}

export interface CalendarState {
  currentDate: Date;
  selectedDate: Date | null;
  selectedRange: { start: Date; end: Date } | null;
  viewMode: ViewMode;
  showWeekNumber: boolean;
  showLunar: boolean;
  firstDayOfWeek: 0 | 1;
}

// ============================================================================
// 事件相关
// ============================================================================

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  category?: string;
  reminder?: number; // 分钟
  recurrence?: RecurrenceRule;
  metadata?: Record<string, any>;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  count?: number;
  byWeekday?: number[];
  byMonthday?: number[];
}

// ============================================================================
// 农历相关
// ============================================================================

export interface LunarDate {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
  yearChinese: string; // 甲子年
  monthChinese: string; // 正月、二月...
  dayChinese: string; // 初一、初二...
  zodiac: string; // 生肖
  solarTerm?: string; // 节气
}

// ============================================================================
// 节假日相关
// ============================================================================

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'public' | 'traditional' | 'custom';
  isOff: boolean; // 是否放假
  description?: string;
}

// ============================================================================
// 视图数据结构
// ============================================================================

export interface DayCell {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayOfMonth: number;
  dayOfWeek: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isDisabled: boolean;
  isSelected: boolean;
  isInRange: boolean;
  lunarInfo?: LunarDate;
  holiday?: Holiday;
  events: CalendarEvent[];
  eventCount: number;
}

export interface WeekRow {
  weekNumber?: number;
  days: DayCell[];
}

export interface MonthViewData {
  year: number;
  month: number;
  weeks: WeekRow[];
  totalDays: number;
}

export interface WeekViewData {
  year: number;
  weekNumber: number;
  days: DayCell[];
  startDate: Date;
  endDate: Date;
}

export interface HourSlot {
  hour: number;
  hourString: string;
  events: CalendarEvent[];
  hasEvents: boolean;
}

export interface DayViewData {
  date: Date;
  dayInfo: DayCell;
  hours: HourSlot[];
}

// ============================================================================
// 主题相关
// ============================================================================

export interface ThemeVariables {
  // 颜色
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderColor: string;
  hoverColor: string;
  selectedColor: string;
  selectedTextColor: string;
  disabledColor: string;
  disabledTextColor: string;
  todayColor: string;
  weekendColor: string;

  // 尺寸
  cellWidth: string;
  cellHeight: string;
  fontSize: string;
  fontSizeSmall: string;
  borderRadius: string;
  spacing: string;

  // 其他
  fontFamily: string;
  boxShadow: string;
  transition: string;
}

export interface Theme {
  name: string;
  variables: ThemeVariables;
}

// ============================================================================
// 国际化相关
// ============================================================================

export interface I18nMessages {
  weekdays: string[];
  weekdaysShort: string[];
  weekdaysMin: string[];
  months: string[];
  monthsShort: string[];
  today: string;
  clear: string;
  confirm: string;
  cancel: string;
  year: string;
  month: string;
  week: string;
  day: string;
  [key: string]: any;
}

// ============================================================================
// 日期选择器相关
// ============================================================================

export interface DatePickerOptions {
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  format?: string;
  placeholder?: string;
  clearable?: boolean;
}

export interface RangePickerOptions extends DatePickerOptions {
  maxRange?: number; // 最大可选天数
  minRange?: number; // 最小可选天数
  separator?: string;
}

// ============================================================================
// 工具函数类型
// ============================================================================

export type DateFormatter = (date: Date, pattern: string) => string;
export type DateParser = (dateStr: string, pattern: string) => Date;
export type Observer<T> = (value: T) => void;
export type Unsubscribe = () => void;