/**
 * @ldesign/calendar-core - 主入口文件
 * @version 1.0.0
 */

// 导出核心类
export { Calendar, createCalendar } from './calendar'
export { EventManager } from './event-manager'
export { ViewManager } from './view-manager'

// 导出类型
export type * from './types'
export type * from './types/enhanced'
export * from './types/errors'

// 导出工具函数
export * from './utils'

// 导出性能优化工具
export * from './performance'

// 导出撤销/重做系统
export * from './undo-redo'

// 导出键盘快捷键系统
export * from './keyboard'

/**
 * 版本号
 */
export const VERSION = '1.0.0'

/**
 * 默认导出
 */
import { Calendar as CalendarClass, createCalendar as createCalendarFn } from './calendar'
export default {
  Calendar: CalendarClass,
  createCalendar: createCalendarFn,
  VERSION,
}
