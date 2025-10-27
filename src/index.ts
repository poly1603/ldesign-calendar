/**
 * @ldesign/calendar - 完整日历组件
 * 主入口文件
 */

// 导出核心类
export { Calendar } from './core/calendar';
export { EventManager } from './core/event-manager';
export { ViewManager } from './core/view-manager';
export { RecurrenceEngine, recurrenceEngine } from './core/recurrence-engine';

// 导出类型
export * from './types';

// 导出工具函数
export * from './utils/date-utils';
export * from './utils/event-utils';
export {
  parseRRule,
  toRRuleString,
  expandRecurrence,
  validateRecurrenceRule,
  getRecurrenceDescription,
} from './utils/rrule-parser';

// 导出存储适配器
export { BaseStorageAdapter } from './storage/storage-adapter';
export { LocalStorageAdapter } from './storage/local-storage';
export { ApiAdapter } from './storage/api-adapter';
export type { ApiConfig } from './storage/api-adapter';

// 导出渲染器
export { BaseRenderer } from './renderers/base-renderer';
export { DOMRenderer } from './renderers/dom-renderer';
export { CanvasRenderer } from './renderers/canvas-renderer';
export { HybridRenderer } from './renderers/hybrid-renderer';

// 导出交互处理器
export { DragHandler } from './interaction/drag-handler';
export { ResizeHandler } from './interaction/resize-handler';
export { CreateHandler } from './interaction/create-handler';

// 导出国际化
export { I18nManager, getI18n, setI18n, t } from './i18n';
export type { I18nConfig, Locale } from './i18n';

// 导出无障碍性
export { A11yManager, createA11yManager } from './a11y';

/**
 * 便捷创建函数
 */
import { Calendar } from './core/calendar';
import type { CalendarConfig } from './types';

export function createCalendar(
  container: HTMLElement | string,
  config: CalendarConfig = {}
): Calendar {
  const element =
    typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container;

  if (!element) {
    throw new Error('Container element not found');
  }

  return new Calendar(element, config);
}

/**
 * 默认导出
 */
export default {
  Calendar,
  createCalendar,
};






