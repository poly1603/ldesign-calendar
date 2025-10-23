/**
 * @ldesign/calendar - 事件管理器
 */

import type { CalendarEvent, StorageAdapter, EventManagerInterface } from '../types';
import { RecurrenceEngine } from './recurrence-engine';
import { generateId, isEventInRange, sortEvents, validateEvent } from '../utils/event-utils';
import { LocalStorageAdapter } from '../storage/local-storage';

/**
 * 事件管理器
 */
export class EventManager implements EventManagerInterface {
  private events: Map<string, CalendarEvent>;
  private storageAdapter: StorageAdapter;
  private recurrenceEngine: RecurrenceEngine;
  private changeListeners: Set<() => void>;

  constructor(storageAdapter?: StorageAdapter) {
    this.events = new Map();
    this.storageAdapter = storageAdapter || new LocalStorageAdapter();
    this.recurrenceEngine = new RecurrenceEngine();
    this.changeListeners = new Set();
  }

  /**
   * 初始化（从存储加载事件）
   */
  async init(): Promise<void> {
    try {
      const events = await this.storageAdapter.load();
      events.forEach(event => {
        this.events.set(event.id, event);
      });
    } catch (error) {
      console.error('Failed to initialize EventManager:', error);
    }
  }

  /**
   * 创建事件
   */
  async createEvent(event: CalendarEvent): Promise<void> {
    // 验证事件
    const errors = validateEvent(event);
    if (errors.length > 0) {
      throw new Error(`事件验证失败: ${errors.join(', ')}`);
    }

    // 如果没有 ID，生成一个
    if (!event.id) {
      event.id = generateId();
    }

    // 验证重复规则
    if (event.recurrence) {
      const validation = this.recurrenceEngine.validate(event.recurrence);
      if (!validation.valid) {
        throw new Error(`重复规则验证失败: ${validation.errors.join(', ')}`);
      }
    }

    // 保存到内存
    this.events.set(event.id, event);

    // 保存到存储
    try {
      if (this.storageAdapter.create) {
        await this.storageAdapter.create(event);
      } else {
        await this.storageAdapter.save(Array.from(this.events.values()));
      }
    } catch (error) {
      // 回滚内存更改
      this.events.delete(event.id);
      throw error;
    }

    // 触发变更通知
    this.notifyChange();
  }

  /**
   * 更新事件
   */
  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<void> {
    const event = this.events.get(id);

    if (!event) {
      throw new Error(`事件不存在: ${id}`);
    }

    // 创建更新后的事件
    const updatedEvent: CalendarEvent = {
      ...event,
      ...updates,
      id, // 保持 ID 不变
    };

    // 验证更新后的事件
    const errors = validateEvent(updatedEvent);
    if (errors.length > 0) {
      throw new Error(`事件验证失败: ${errors.join(', ')}`);
    }

    // 验证重复规则
    if (updatedEvent.recurrence) {
      const validation = this.recurrenceEngine.validate(updatedEvent.recurrence);
      if (!validation.valid) {
        throw new Error(`重复规则验证失败: ${validation.errors.join(', ')}`);
      }
    }

    // 保存旧事件（用于回滚）
    const oldEvent = event;

    // 更新内存
    this.events.set(id, updatedEvent);

    // 更新存储
    try {
      if (this.storageAdapter.update) {
        await this.storageAdapter.update(id, updates);
      } else {
        await this.storageAdapter.save(Array.from(this.events.values()));
      }
    } catch (error) {
      // 回滚内存更改
      this.events.set(id, oldEvent);
      throw error;
    }

    // 触发变更通知
    this.notifyChange();
  }

  /**
   * 删除事件
   */
  async deleteEvent(id: string): Promise<void> {
    const event = this.events.get(id);

    if (!event) {
      throw new Error(`事件不存在: ${id}`);
    }

    // 从内存删除
    this.events.delete(id);

    // 从存储删除
    try {
      if (this.storageAdapter.delete) {
        await this.storageAdapter.delete(id);
      } else {
        await this.storageAdapter.save(Array.from(this.events.values()));
      }
    } catch (error) {
      // 回滚内存更改
      this.events.set(id, event);
      throw error;
    }

    // 触发变更通知
    this.notifyChange();
  }

  /**
   * 获取事件（包含重复事件展开）
   */
  getEvents(start?: Date, end?: Date): CalendarEvent[] {
    const allEvents: CalendarEvent[] = [];

    this.events.forEach(event => {
      if (this.recurrenceEngine.isRecurring(event)) {
        // 展开重复事件
        if (start && end) {
          const instances = this.recurrenceEngine.expand(event, start, end);
          allEvents.push(...instances);
        } else {
          // 如果没有指定范围，只返回原始事件
          allEvents.push(event);
        }
      } else {
        // 普通事件
        if (start && end) {
          if (isEventInRange(event, start, end)) {
            allEvents.push(event);
          }
        } else {
          allEvents.push(event);
        }
      }
    });

    return sortEvents(allEvents);
  }

  /**
   * 查找单个事件
   */
  findEvent(id: string): CalendarEvent | null {
    return this.events.get(id) || null;
  }

  /**
   * 获取所有事件（不展开重复事件）
   */
  getAllEvents(): CalendarEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * 清除所有事件
   */
  async clear(): Promise<void> {
    // 保存旧数据（用于回滚）
    const oldEvents = new Map(this.events);

    // 清空内存
    this.events.clear();

    // 清空存储
    try {
      await this.storageAdapter.clear();
    } catch (error) {
      // 回滚内存更改
      this.events = oldEvents;
      throw error;
    }

    // 触发变更通知
    this.notifyChange();
  }

  /**
   * 批量导入事件
   */
  async importEvents(events: CalendarEvent[]): Promise<void> {
    for (const event of events) {
      await this.createEvent(event);
    }
  }

  /**
   * 导出事件
   */
  exportEvents(): CalendarEvent[] {
    return this.getAllEvents();
  }

  /**
   * 搜索事件
   */
  searchEvents(query: string): CalendarEvent[] {
    const lowerQuery = query.toLowerCase();
    const results: CalendarEvent[] = [];

    this.events.forEach(event => {
      if (
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description?.toLowerCase().includes(lowerQuery) ||
        event.location?.toLowerCase().includes(lowerQuery)
      ) {
        results.push(event);
      }
    });

    return sortEvents(results);
  }

  /**
   * 监听变更
   */
  onChange(callback: () => void): () => void {
    this.changeListeners.add(callback);

    // 返回取消监听函数
    return () => {
      this.changeListeners.delete(callback);
    };
  }

  /**
   * 通知变更
   */
  private notifyChange(): void {
    this.changeListeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in change listener:', error);
      }
    });
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number;
    recurring: number;
    upcoming: number;
    past: number;
  } {
    const now = new Date();
    let recurring = 0;
    let upcoming = 0;
    let past = 0;

    this.events.forEach(event => {
      if (this.recurrenceEngine.isRecurring(event)) {
        recurring++;
      }

      if (event.start > now) {
        upcoming++;
      } else if (event.end < now) {
        past++;
      }
    });

    return {
      total: this.events.size,
      recurring,
      upcoming,
      past,
    };
  }
}

