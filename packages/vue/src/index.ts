/**
 * @ldesign/calendar-vue - Vue3 日历组件
 */

import type { App } from 'vue';
import Calendar from './Calendar.vue';

// 导出组件
export { Calendar };
export { default as LCalendar } from './Calendar.vue';

// 导出 Composable
export { useCalendar } from './composables/useCalendar';
export type { UseCalendarReturn } from './composables/useCalendar';

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

// Vue 插件安装
export const install = (app: App) => {
  app.component('LCalendar', Calendar);
  app.component('Calendar', Calendar);
};

// 默认导出
export default {
  install,
  Calendar,
  LCalendar: Calendar,
};

// 版本号
export const VERSION = '0.2.0';

