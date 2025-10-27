/**
 * @ldesign/calendar-react - React 日历组件
 */

// 导出组件
export { Calendar } from './Calendar';
export type { CalendarProps, CalendarRef } from './Calendar';

// 导出 Hook
export { useCalendar } from './hooks/useCalendar';
export type { UseCalendarReturn } from './hooks/useCalendar';

// 导出核心类型
export type {
  Calendar as CalendarCore,
  CalendarConfig,
  CalendarEvent,
  CalendarView,
  CalendarCallbacks,
  RecurrenceRule,
  StorageAdapter,
} from '@ldesign/calendar-core';

// 版本号
export const VERSION = '0.2.0';

// 默认导出
export { Calendar as default } from './Calendar';

