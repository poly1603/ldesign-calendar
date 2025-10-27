/**
 * @ldesign/calendar-core - 主入口文件
 */

// 导出核心类
export { Calendar, createCalendar } from './calendar';
export { EventManager } from './event-manager';
export { ViewManager } from './view-manager';

// 导出类型
export * from './types';

// 导出工具函数
export * from './utils';

/**
 * 版本号
 */
export const VERSION = '0.2.0';

/**
 * 默认导出
 */
export default {
  Calendar,
  createCalendar,
  VERSION,
};

