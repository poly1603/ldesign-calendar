/**
 * @ldesign/calendar - 重复事件引擎
 */

import type { CalendarEvent, RecurrenceRule } from '../types';
import { expandRecurrence, validateRecurrenceRule, getRecurrenceDescription } from '../utils/rrule-parser';

/**
 * 重复事件引擎
 */
export class RecurrenceEngine {
  /**
   * 展开重复事件
   */
  expand(
    event: CalendarEvent,
    rangeStart: Date,
    rangeEnd: Date,
    maxInstances: number = 100
  ): CalendarEvent[] {
    return expandRecurrence(event, rangeStart, rangeEnd, maxInstances);
  }

  /**
   * 验证重复规则
   */
  validate(rule: RecurrenceRule): { valid: boolean; errors: string[] } {
    const errors = validateRecurrenceRule(rule);
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 获取重复规则描述
   */
  getDescription(rule: RecurrenceRule, locale?: string): string {
    return getRecurrenceDescription(rule, locale);
  }

  /**
   * 判断事件是否为重复事件
   */
  isRecurring(event: CalendarEvent): boolean {
    return !!event.recurrence;
  }

  /**
   * 判断事件是否为重复事件实例
   */
  isRecurringInstance(event: CalendarEvent): boolean {
    return !!event.originalEventId;
  }

  /**
   * 获取原始事件 ID
   */
  getOriginalEventId(event: CalendarEvent): string {
    return event.originalEventId || event.id;
  }

  /**
   * 从实例 ID 解析日期
   */
  parseDateFromInstanceId(instanceId: string): Date | null {
    const parts = instanceId.split('_');
    const timestamp = parseInt(parts[parts.length - 1], 10);

    if (isNaN(timestamp)) {
      return null;
    }

    return new Date(timestamp);
  }
}

/**
 * 默认导出单例
 */
export const recurrenceEngine = new RecurrenceEngine();

