/**
 * @ldesign/calendar - 事件工具函数
 */

import type { CalendarEvent, EventLayout } from '../types';
import { isSameDay, isDateInRange, minutesBetween } from './date-utils';

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 判断两个事件是否重叠
 */
export function hasOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
  return event1.start < event2.end && event1.end > event2.start;
}

/**
 * 判断事件是否在指定日期范围内
 */
export function isEventInRange(event: CalendarEvent, start: Date, end: Date): boolean {
  return hasOverlap(event, { ...event, start, end });
}

/**
 * 判断事件是否在指定日期
 */
export function isEventOnDate(event: CalendarEvent, date: Date): boolean {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return hasOverlap(event, { ...event, start: dayStart, end: dayEnd });
}

/**
 * 按日期分组事件
 */
export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>();

  events.forEach(event => {
    const dateKey = event.start.toDateString();
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(event);
  });

  return grouped;
}

/**
 * 排序事件（按开始时间）
 */
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * 计算事件重叠布局（用于周/日视图）
 */
export function calculateEventLayout(events: CalendarEvent[]): EventLayout[] {
  if (events.length === 0) return [];

  const sorted = sortEvents(events);
  const columns: CalendarEvent[][] = [];

  // 将事件分配到列中
  sorted.forEach(event => {
    let placed = false;

    // 尝试放入现有列
    for (const column of columns) {
      const lastEvent = column[column.length - 1];
      if (!hasOverlap(lastEvent, event)) {
        column.push(event);
        placed = true;
        break;
      }
    }

    // 如果无法放入现有列，创建新列
    if (!placed) {
      columns.push([event]);
    }
  });

  // 计算每个事件的布局信息
  const layouts: EventLayout[] = [];
  const eventColumnMap = new Map<string, number>();

  columns.forEach((column, colIndex) => {
    column.forEach(event => {
      eventColumnMap.set(event.id, colIndex);
    });
  });

  sorted.forEach(event => {
    const colIndex = eventColumnMap.get(event.id)!;

    // 计算与此事件重叠的最大列数
    let maxColumns = 1;
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].some(e => hasOverlap(e, event))) {
        maxColumns = Math.max(maxColumns, i + 1);
      }
    }

    layouts.push({
      event,
      left: (colIndex / maxColumns) * 100,
      width: (1 / maxColumns) * 100,
      columnIndex: colIndex,
      totalColumns: maxColumns,
    });
  });

  return layouts;
}

/**
 * 获取事件显示文本
 */
export function getEventDisplayText(event: CalendarEvent, maxLength?: number): string {
  const text = event.title || '(无标题)';
  if (maxLength && text.length > maxLength) {
    return text.substring(0, maxLength - 3) + '...';
  }
  return text;
}

/**
 * 获取事件颜色
 */
export function getEventColor(event: CalendarEvent): {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
} {
  return {
    backgroundColor: event.backgroundColor || event.color || '#3788d8',
    borderColor: event.borderColor || event.color || '#3788d8',
    textColor: event.textColor || '#ffffff',
  };
}

/**
 * 克隆事件
 */
export function cloneEvent(event: CalendarEvent): CalendarEvent {
  return {
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
    recurrence: event.recurrence ? { ...event.recurrence } : undefined,
    extendedProps: event.extendedProps ? { ...event.extendedProps } : undefined,
  };
}

/**
 * 验证事件数据
 */
export function validateEvent(event: Partial<CalendarEvent>): string[] {
  const errors: string[] = [];

  if (!event.title || event.title.trim() === '') {
    errors.push('标题不能为空');
  }

  if (!event.start) {
    errors.push('开始时间不能为空');
  }

  if (!event.end) {
    errors.push('结束时间不能为空');
  }

  if (event.start && event.end && event.start >= event.end) {
    errors.push('结束时间必须晚于开始时间');
  }

  return errors;
}

/**
 * 合并事件更新
 */
export function mergeEventUpdates(
  original: CalendarEvent,
  updates: Partial<CalendarEvent>
): CalendarEvent {
  return {
    ...original,
    ...updates,
    start: updates.start ? new Date(updates.start) : original.start,
    end: updates.end ? new Date(updates.end) : original.end,
  };
}

/**
 * 计算事件在视图中的位置（像素）
 */
export function calculateEventPosition(
  event: CalendarEvent,
  containerHeight: number,
  startHour: number = 0,
  endHour: number = 24
): { top: number; height: number } {
  const totalMinutes = (endHour - startHour) * 60;
  const pixelsPerMinute = containerHeight / totalMinutes;

  const eventStartMinutes = event.start.getHours() * 60 + event.start.getMinutes() - (startHour * 60);
  const eventDuration = minutesBetween(event.start, event.end);

  return {
    top: eventStartMinutes * pixelsPerMinute,
    height: eventDuration * pixelsPerMinute,
  };
}

/**
 * 判断事件是否可编辑
 */
export function isEventEditable(event: CalendarEvent, globalEditable?: boolean): boolean {
  if (event.editable !== undefined) {
    return event.editable;
  }
  return globalEditable !== false;
}

/**
 * 判断事件是否可拖拽
 */
export function isEventDraggable(event: CalendarEvent, globalEditable?: boolean): boolean {
  if (event.draggable !== undefined) {
    return event.draggable;
  }
  return isEventEditable(event, globalEditable);
}

/**
 * 判断事件是否可调整大小
 */
export function isEventResizable(event: CalendarEvent, globalEditable?: boolean): boolean {
  if (event.resizable !== undefined) {
    return event.resizable;
  }
  return isEventEditable(event, globalEditable);
}

/**
 * 过滤事件
 */
export function filterEvents(
  events: CalendarEvent[],
  predicate: (event: CalendarEvent) => boolean
): CalendarEvent[] {
  return events.filter(predicate);
}

/**
 * 查找事件
 */
export function findEvent(
  events: CalendarEvent[],
  predicate: (event: CalendarEvent) => boolean
): CalendarEvent | undefined {
  return events.find(predicate);
}

