/**
 * @ldesign/calendar-core
 * Framework-agnostic calendar core library
 */

// 导出类型
export * from './types';

// 导出工具类
export { DateUtil } from './utils/date';
export { LunarCalendar } from './utils/lunar';
export * from './utils/constants';

// 导出国际化
export { I18n, defaultI18n } from './i18n/I18n';
export { zhCN } from './i18n/locales/zh-CN';
export { enUS } from './i18n/locales/en-US';

// 导出核心模块
export { CalendarCore } from './core/CalendarCore';
export { HolidayManager } from './core/HolidayManager';
export { EventManager } from './core/EventManager';
export { ThemeManager } from './core/ThemeManager';

// 导出视图策略
export {
  ViewStrategy,
  MonthViewStrategy,
  WeekViewStrategy,
  DayViewStrategy,
  ViewStrategyFactory,
} from './strategies/ViewStrategy';

// 导出选择器
export { DatePicker } from './pickers/DatePicker';
export { RangePicker } from './pickers/RangePicker';

// 版本信息
export const VERSION = '0.1.0';