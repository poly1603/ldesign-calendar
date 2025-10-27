/**
 * 事件处理 Worker - 处理耗时的事件计算
 * @module event-processor.worker
 */

import type { CalendarEvent, RecurrenceRule } from '../types';

// Worker 消息类型
export interface WorkerMessage {
  id: string;
  type: 'process-events' | 'expand-recurrence' | 'detect-conflicts' | 'calculate-positions';
  data: any;
}

export interface WorkerResponse {
  id: string;
  type: string;
  result?: any;
  error?: string;
}

// 事件处理结果
export interface ProcessedEvent extends CalendarEvent {
  // 计算后的位置信息
  position?: {
    column: number;
    width: number;
    left: number;
  };
  // 冲突信息
  conflicts?: string[]; // 冲突的事件ID列表
  // 是否是重复事件的实例
  isRecurrenceInstance?: boolean;
  // 原始重复事件ID
  recurringEventId?: string;
}

/**
 * 展开重复规则，生成事件实例
 */
function expandRecurrenceRule(
  event: CalendarEvent,
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  if (!event.recurrence) {
    return [event];
  }

  const instances: CalendarEvent[] = [];
  const rule = event.recurrence;
  const eventDuration = event.end.getTime() - event.start.getTime();

  let currentDate = new Date(event.start);
  let instanceCount = 0;

  // 设置结束条件
  const maxDate = rule.until || endDate;
  const maxCount = rule.count || 1000; // 防止无限循环

  while (currentDate <= maxDate && instanceCount < maxCount) {
    // 检查是否在查询范围内
    if (currentDate >= startDate && currentDate <= endDate) {
      // 检查是否符合规则
      if (matchesRecurrenceRule(currentDate, event.start, rule)) {
        // 创建事件实例
        const instance: CalendarEvent = {
          ...event,
          id: `${event.id}_${instanceCount}`,
          start: new Date(currentDate),
          end: new Date(currentDate.getTime() + eventDuration),
          recurrence: undefined, // 实例不包含重复规则
        };

        // 添加元数据
        (instance as ProcessedEvent).isRecurrenceInstance = true;
        (instance as ProcessedEvent).recurringEventId = event.id;

        instances.push(instance);
        instanceCount++;
      }
    }

    // 移动到下一个可能的日期
    currentDate = getNextRecurrenceDate(currentDate, rule);

    // 检查是否超出结束日期
    if (currentDate > maxDate) {
      break;
    }
  }

  return instances;
}

/**
 * 检查日期是否符合重复规则
 */
function matchesRecurrenceRule(
  date: Date,
  startDate: Date,
  rule: RecurrenceRule
): boolean {
  // 检查星期
  if (rule.byweekday && rule.byweekday.length > 0) {
    const dayOfWeek = date.getDay();
    if (!rule.byweekday.includes(dayOfWeek)) {
      return false;
    }
  }

  // 检查月份中的日期
  if (rule.bymonthday && rule.bymonthday.length > 0) {
    const dayOfMonth = date.getDate();
    if (!rule.bymonthday.includes(dayOfMonth)) {
      return false;
    }
  }

  // 检查月份
  if (rule.bymonth && rule.bymonth.length > 0) {
    const month = date.getMonth() + 1; // getMonth() 返回 0-11
    if (!rule.bymonth.includes(month)) {
      return false;
    }
  }

  // 检查间隔
  if (rule.interval && rule.interval > 1) {
    const diff = getDifferenceByFreq(date, startDate, rule.freq);
    if (diff % rule.interval !== 0) {
      return false;
    }
  }

  return true;
}

/**
 * 根据频率计算日期差异
 */
function getDifferenceByFreq(date1: Date, date2: Date, freq: string): number {
  switch (freq) {
    case 'daily':
      return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
    case 'weekly':
      return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24 * 7));
    case 'monthly':
      return (date1.getFullYear() - date2.getFullYear()) * 12 +
        (date1.getMonth() - date2.getMonth());
    case 'yearly':
      return date1.getFullYear() - date2.getFullYear();
    default:
      return 0;
  }
}

/**
 * 获取下一个重复日期
 */
function getNextRecurrenceDate(currentDate: Date, rule: RecurrenceRule): Date {
  const nextDate = new Date(currentDate);
  const interval = rule.interval || 1;

  switch (rule.freq) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * interval));
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
  }

  return nextDate;
}

/**
 * 检测事件冲突
 */
function detectEventConflicts(events: ProcessedEvent[]): ProcessedEvent[] {
  const processedEvents = [...events];

  // 按开始时间排序
  processedEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

  // 检测冲突
  for (let i = 0; i < processedEvents.length; i++) {
    const event1 = processedEvents[i];
    event1.conflicts = [];

    for (let j = 0; j < processedEvents.length; j++) {
      if (i === j) continue;

      const event2 = processedEvents[j];

      // 检查时间重叠
      if (eventsOverlap(event1, event2)) {
        event1.conflicts.push(event2.id);
      }
    }
  }

  return processedEvents;
}

/**
 * 检查两个事件是否重叠
 */
function eventsOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
  // 如果是全天事件，使用日期比较
  if (event1.allDay && event2.allDay) {
    return event1.start.toDateString() === event2.start.toDateString();
  }

  // 非全天事件，检查时间重叠
  return event1.start < event2.end && event1.end > event2.start;
}

/**
 * 计算事件位置（用于避免重叠显示）
 */
function calculateEventPositions(
  events: ProcessedEvent[],
  viewType: 'day' | 'week'
): ProcessedEvent[] {
  // 按日期分组
  const eventsByDate = new Map<string, ProcessedEvent[]>();

  events.forEach(event => {
    const dateKey = event.start.toDateString();
    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, []);
    }
    eventsByDate.get(dateKey)!.push(event);
  });

  // 为每天的事件计算位置
  eventsByDate.forEach((dayEvents) => {
    // 按开始时间排序
    dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

    // 计算列位置
    const columns: ProcessedEvent[][] = [];

    dayEvents.forEach(event => {
      let placed = false;

      // 尝试放置在现有列中
      for (let col = 0; col < columns.length; col++) {
        const column = columns[col];
        const lastEvent = column[column.length - 1];

        // 如果不重叠，可以放在这一列
        if (!eventsOverlap(event, lastEvent)) {
          column.push(event);
          event.position = {
            column: col,
            width: 0, // 稍后计算
            left: 0,  // 稍后计算
          };
          placed = true;
          break;
        }
      }

      // 如果没有合适的列，创建新列
      if (!placed) {
        columns.push([event]);
        event.position = {
          column: columns.length - 1,
          width: 0,
          left: 0,
        };
      }
    });

    // 计算宽度和左边距
    const totalColumns = columns.length;
    dayEvents.forEach(event => {
      if (event.position) {
        event.position.width = 100 / totalColumns;
        event.position.left = event.position.column * event.position.width;
      }
    });
  });

  return events;
}

/**
 * 处理事件列表
 */
function processEvents(
  events: CalendarEvent[],
  dateRange: { start: Date; end: Date },
  options: {
    expandRecurrence?: boolean;
    detectConflicts?: boolean;
    calculatePositions?: boolean;
    viewType?: 'day' | 'week';
  } = {}
): ProcessedEvent[] {
  let processedEvents: ProcessedEvent[] = [];

  // 1. 展开重复事件
  if (options.expandRecurrence) {
    events.forEach(event => {
      if (event.recurrence) {
        const instances = expandRecurrenceRule(
          event,
          dateRange.start,
          dateRange.end
        );
        processedEvents.push(...instances as ProcessedEvent[]);
      } else {
        processedEvents.push(event as ProcessedEvent);
      }
    });
  } else {
    processedEvents = events.map(e => ({ ...e } as ProcessedEvent));
  }

  // 2. 过滤在日期范围内的事件
  processedEvents = processedEvents.filter(event =>
    event.start <= dateRange.end && event.end >= dateRange.start
  );

  // 3. 检测冲突
  if (options.detectConflicts) {
    processedEvents = detectEventConflicts(processedEvents);
  }

  // 4. 计算位置
  if (options.calculatePositions && options.viewType) {
    processedEvents = calculateEventPositions(processedEvents, options.viewType);
  }

  return processedEvents;
}

// Worker 消息处理
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { id, type, data } = event.data;

  try {
    let result: any;

    switch (type) {
      case 'process-events':
        result = processEvents(
          data.events,
          {
            start: new Date(data.dateRange.start),
            end: new Date(data.dateRange.end),
          },
          data.options
        );
        break;

      case 'expand-recurrence':
        result = expandRecurrenceRule(
          data.event,
          new Date(data.startDate),
          new Date(data.endDate)
        );
        break;

      case 'detect-conflicts':
        result = detectEventConflicts(data.events);
        break;

      case 'calculate-positions':
        result = calculateEventPositions(data.events, data.viewType);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    // 发送响应
    const response: WorkerResponse = {
      id,
      type,
      result,
    };
    self.postMessage(response);

  } catch (error) {
    // 发送错误响应
    const response: WorkerResponse = {
      id,
      type,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    self.postMessage(response);
  }
});

// 导出类型供主线程使用
export type { ProcessedEvent };

