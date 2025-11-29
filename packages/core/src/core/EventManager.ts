/**
 * EventManager - 事件管理系统
 * 支持事件 CRUD、重复事件、冲突检测、导入导出
 */

import type { CalendarEvent, RecurrenceRule, Observer, Unsubscribe } from '../types';
import { DateUtil } from '../utils/date';

export class EventManager {
  private events: Map<string, CalendarEvent>;
  private observers: Set<Observer<void>>;

  constructor() {
    this.events = new Map();
    this.observers = new Set();
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 通知观察者
   */
  private notify(): void {
    this.observers.forEach(observer => observer());
  }

  /**
   * 订阅事件变更
   */
  subscribe(observer: Observer<void>): Unsubscribe {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }

  /**
   * 添加事件
   */
  addEvent(event: Omit<CalendarEvent, 'id'> | CalendarEvent): string {
    const id = 'id' in event ? event.id : this.generateId();
    const newEvent: CalendarEvent = {
      ...event,
      id,
    };

    // 验证事件
    this.validateEvent(newEvent);

    this.events.set(id, newEvent);
    this.notify();
    return id;
  }

  /**
   * 批量添加事件
   */
  addEvents(events: Array<Omit<CalendarEvent, 'id'> | CalendarEvent>): string[] {
    const ids = events.map(event => this.addEvent(event));
    return ids;
  }

  /**
   * 更新事件
   */
  updateEvent(id: string, updates: Partial<CalendarEvent>): void {
    const event = this.events.get(id);
    if (!event) {
      throw new Error(`Event with id "${id}" not found`);
    }

    const updatedEvent: CalendarEvent = {
      ...event,
      ...updates,
      id, // 保持 ID 不变
    };

    // 验证更新后的事件
    this.validateEvent(updatedEvent);

    this.events.set(id, updatedEvent);
    this.notify();
  }

  /**
   * 删除事件
   */
  removeEvent(id: string): void {
    if (!this.events.has(id)) {
      throw new Error(`Event with id "${id}" not found`);
    }

    this.events.delete(id);
    this.notify();
  }

  /**
   * 批量删除事件
   */
  removeEvents(ids: string[]): void {
    ids.forEach(id => this.removeEvent(id));
  }

  /**
   * 获取事件
   */
  getEvent(id: string): CalendarEvent | null {
    return this.events.get(id) || null;
  }

  /**
   * 获取所有事件
   */
  getAllEvents(): CalendarEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * 获取日期范围内的事件
   */
  getEventsInRange(start: Date, end: Date): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    this.events.forEach(event => {
      // 处理重复事件
      if (event.recurrence) {
        const expandedEvents = this.expandRecurringEvent(event, start, end);
        events.push(...expandedEvents);
      } else {
        // 检查事件是否在范围内
        if (this.isEventInRange(event, start, end)) {
          events.push(event);
        }
      }
    });

    // 按开始时间排序
    return events.sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  /**
   * 获取某天的事件
   */
  getEventsOnDate(date: Date): CalendarEvent[] {
    const startOfDay = DateUtil.getStartOfDay(date);
    const endOfDay = DateUtil.getEndOfDay(date);
    return this.getEventsInRange(startOfDay, endOfDay);
  }

  /**
   * 获取某月的事件
   */
  getEventsInMonth(year: number, month: number): CalendarEvent[] {
    const start = new Date(year, month, 1);
    const end = DateUtil.getEndOfMonth(start);
    return this.getEventsInRange(start, end);
  }

  /**
   * 搜索事件
   */
  searchEvents(keyword: string): CalendarEvent[] {
    const lowerKeyword = keyword.toLowerCase();
    const events = this.getAllEvents();

    return events.filter(event => {
      return (
        event.title.toLowerCase().includes(lowerKeyword) ||
        event.description?.toLowerCase().includes(lowerKeyword) ||
        event.category?.toLowerCase().includes(lowerKeyword)
      );
    });
  }

  /**
   * 判断事件是否在范围内
   */
  private isEventInRange(event: CalendarEvent, start: Date, end: Date): boolean {
    // 事件开始时间在范围内，或事件结束时间在范围内，或事件跨越整个范围
    return (
      DateUtil.isBetween(event.start, start, end) ||
      DateUtil.isBetween(event.end, start, end) ||
      (DateUtil.isBefore(event.start, start) && DateUtil.isAfter(event.end, end))
    );
  }

  /**
   * 验证事件
   */
  private validateEvent(event: CalendarEvent): void {
    if (!event.title || event.title.trim() === '') {
      throw new Error('Event title is required');
    }

    if (!event.start || !(event.start instanceof Date)) {
      throw new Error('Event start date is required');
    }

    if (!event.end || !(event.end instanceof Date)) {
      throw new Error('Event end date is required');
    }

    if (DateUtil.isAfter(event.start, event.end)) {
      throw new Error('Event start date must be before end date');
    }
  }

  /**
   * 检测事件冲突
   */
  hasConflict(event: CalendarEvent): boolean {
    return this.getConflictingEvents(event).length > 0;
  }

  /**
   * 获取冲突的事件
   */
  getConflictingEvents(event: CalendarEvent): CalendarEvent[] {
    const conflicts: CalendarEvent[] = [];

    this.events.forEach(existingEvent => {
      // 排除自身
      if (existingEvent.id === event.id) {
        return;
      }

      // 检查时间是否重叠
      if (this.eventsOverlap(event, existingEvent)) {
        conflicts.push(existingEvent);
      }
    });

    return conflicts;
  }

  /**
   * 判断两个事件是否重叠
   */
  private eventsOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
    return (
      DateUtil.isBefore(event1.start, event2.end) &&
      DateUtil.isAfter(event1.end, event2.start)
    );
  }

  /**
   * 展开重复事件
   */
  expandRecurringEvent(event: CalendarEvent, start: Date, end: Date): CalendarEvent[] {
    if (!event.recurrence) {
      return [event];
    }

    const expanded: CalendarEvent[] = [];
    const { frequency, interval, endDate, count, byWeekday, byMonthday } = event.recurrence;
    
    let currentDate = new Date(event.start);
    let occurrenceCount = 0;

    while (DateUtil.isBefore(currentDate, end) || DateUtil.isSameDay(currentDate, end)) {
      // 检查是否超出重复限制
      if (endDate && DateUtil.isAfter(currentDate, endDate)) {
        break;
      }
      if (count && occurrenceCount >= count) {
        break;
      }

      // 检查是否满足重复条件
      if (this.matchesRecurrenceRule(currentDate, event.recurrence)) {
        // 计算该次重复的结束时间
        const duration = event.end.getTime() - event.start.getTime();
        const occurrenceEnd = new Date(currentDate.getTime() + duration);

        // 检查是否在查询范围内
        if (DateUtil.isAfter(occurrenceEnd, start)) {
          expanded.push({
            ...event,
            id: `${event.id}_${currentDate.getTime()}`,
            start: new Date(currentDate),
            end: occurrenceEnd,
          });
          occurrenceCount++;
        }
      }

      // 移动到下一个可能的日期
      currentDate = this.getNextRecurrenceDate(currentDate, frequency, interval);
    }

    return expanded;
  }

  /**
   * 检查日期是否匹配重复规则
   */
  private matchesRecurrenceRule(date: Date, rule: RecurrenceRule): boolean {
    // 检查星期
    if (rule.byWeekday && rule.byWeekday.length > 0) {
      if (!rule.byWeekday.includes(date.getDay())) {
        return false;
      }
    }

    // 检查月中的日期
    if (rule.byMonthday && rule.byMonthday.length > 0) {
      if (!rule.byMonthday.includes(date.getDate())) {
        return false;
      }
    }

    return true;
  }

  /**
   * 获取下一个重复日期
   */
  private getNextRecurrenceDate(date: Date, frequency: RecurrenceRule['frequency'], interval: number): Date {
    switch (frequency) {
      case 'daily':
        return DateUtil.addDays(date, interval);
      case 'weekly':
        return DateUtil.addDays(date, interval * 7);
      case 'monthly':
        return DateUtil.addMonths(date, interval);
      case 'yearly':
        return DateUtil.addYears(date, interval);
      default:
        return date;
    }
  }

  /**
   * 导出为 ICS 格式 (简化版)
   */
  exportToICS(): string {
    const events = this.getAllEvents();
    let ics = 'BEGIN:VCALENDAR\n';
    ics += 'VERSION:2.0\n';
    ics += 'PRODID:-//LDesign Calendar//EN\n';

    events.forEach(event => {
      ics += 'BEGIN:VEVENT\n';
      ics += `UID:${event.id}\n`;
      ics += `DTSTART:${this.formatICSDate(event.start)}\n`;
      ics += `DTEND:${this.formatICSDate(event.end)}\n`;
      ics += `SUMMARY:${event.title}\n`;
      if (event.description) {
        ics += `DESCRIPTION:${event.description}\n`;
      }
      ics += 'END:VEVENT\n';
    });

    ics += 'END:VCALENDAR';
    return ics;
  }

  /**
   * 格式化 ICS 日期
   */
  private formatICSDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /**
   * 从 ICS 导入 (简化版)
   */
  importFromICS(icsData: string): void {
    console.warn('ICS import is simplified. Full RFC 5545 support requires a dedicated parser.');
    // 这里应该实现完整的 ICS 解析，但为了简化，暂时只是占位
  }

  /**
   * 导出为 JSON
   */
  exportToJSON(): string {
    const events = this.getAllEvents().map(event => ({
      ...event,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
    }));
    return JSON.stringify(events, null, 2);
  }

  /**
   * 从 JSON 导入
   */
  importFromJSON(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      const events = Array.isArray(data) ? data : [data];

      events.forEach((eventData: any) => {
        this.addEvent({
          ...eventData,
          start: new Date(eventData.start),
          end: new Date(eventData.end),
        });
      });
    } catch (error) {
      console.error('Failed to import events from JSON:', error);
      throw new Error('Invalid JSON data');
    }
  }

  /**
   * 清除所有事件
   */
  clearAllEvents(): void {
    this.events.clear();
    this.notify();
  }

  /**
   * 克隆实例
   */
  clone(): EventManager {
    const cloned = new EventManager();
    this.events.forEach(event => {
      cloned.addEvent({ ...event });
    });
    return cloned;
  }
}