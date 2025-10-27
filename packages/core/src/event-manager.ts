/**
 * @ldesign/calendar-core - 事件管理器（优化版）
 * 添加操作队列和优化内存使用
 */

import type { CalendarEvent, StorageAdapter, EventManagerInterface } from './types';
import { generateId, validateEvent, sortEvents, isEventInRange } from './utils/event';
import { EventEmitter } from './utils/event-emitter';

/**
 * 本地存储适配器（默认）
 */
class LocalStorageAdapter implements StorageAdapter {
  private storageKey = 'ldesign_calendar_events';

  async save(events: CalendarEvent[]): Promise<void> {
    try {
      const data = JSON.stringify(events.map(e => ({
        ...e,
        start: e.start.toISOString(),
        end: e.end.toISOString(),
      })));
      localStorage.setItem(this.storageKey, data);
    } catch (error) {
      console.error('Failed to save events:', error);
      throw error;
    }
  }

  async load(): Promise<CalendarEvent[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const events = JSON.parse(data);
      return events.map((e: any) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }));
    } catch (error) {
      console.error('Failed to load events:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }
}

/**
 * 事件管理器
 */
export class EventManager implements EventManagerInterface {
  private events: Map<string, CalendarEvent>;
  private storageAdapter: StorageAdapter;
  private eventEmitter: EventEmitter;
  private operationLock = false; // 操作锁

  constructor(storageAdapter?: StorageAdapter) {
    this.events = new Map();
    this.storageAdapter = storageAdapter || new LocalStorageAdapter();
    this.eventEmitter = new EventEmitter();
  }

  /**
   * 初始化（从存储加载事件）
   */
  async init(): Promise<void> {
    try {
      const events = await this.storageAdapter.load();
      this.events.clear();
      for (const event of events) {
        this.events.set(event.id, event);
      }
    } catch (error) {
      console.error('Failed to initialize EventManager:', error);
    }
  }

  /**
   * 创建事件（优化：添加锁机制）
   */
  async createEvent(event: CalendarEvent): Promise<void> {
    // 等待锁释放
    await this.waitForLock();
    this.operationLock = true;

    try {
      // 验证事件
      const errors = validateEvent(event);
      if (errors.length > 0) {
        throw new Error(`事件验证失败: ${errors.join(', ')}`);
      }

      // 如果没有 ID，生成一个
      if (!event.id) {
        event.id = generateId();
      }

      // 检查 ID 是否已存在
      if (this.events.has(event.id)) {
        throw new Error(`事件 ID 已存在: ${event.id}`);
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
    } finally {
      this.operationLock = false;
    }
  }

  /**
   * 更新事件
   */
  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<void> {
    await this.waitForLock();
    this.operationLock = true;

    try {
      const event = this.events.get(id);

      if (!event) {
        throw new Error(`事件不存在: ${id}`);
      }

      // 创建更新后的事件
      const updatedEvent: CalendarEvent = {
        ...event,
        ...updates,
        id, // 保持 ID 不变
        start: updates.start ? new Date(updates.start) : event.start,
        end: updates.end ? new Date(updates.end) : event.end,
      };

      // 验证更新后的事件
      const errors = validateEvent(updatedEvent);
      if (errors.length > 0) {
        throw new Error(`事件验证失败: ${errors.join(', ')}`);
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
    } finally {
      this.operationLock = false;
    }
  }

  /**
   * 删除事件
   */
  async deleteEvent(id: string): Promise<void> {
    await this.waitForLock();
    this.operationLock = true;

    try {
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
    } finally {
      this.operationLock = false;
    }
  }

  /**
   * 获取事件
   */
  getEvents(start?: Date, end?: Date): CalendarEvent[] {
    let events = Array.from(this.events.values());

    // 过滤日期范围
    if (start && end) {
      events = events.filter(event => isEventInRange(event, start, end));
    }

    return sortEvents(events);
  }

  /**
   * 查找单个事件
   */
  findEvent(id: string): CalendarEvent | null {
    return this.events.get(id) || null;
  }

  /**
   * 获取所有事件
   */
  getAllEvents(): CalendarEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * 清除所有事件
   */
  async clear(): Promise<void> {
    await this.waitForLock();
    this.operationLock = true;

    try {
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
    } finally {
      this.operationLock = false;
    }
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

    for (const event of this.events.values()) {
      if (
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description?.toLowerCase().includes(lowerQuery) ||
        event.location?.toLowerCase().includes(lowerQuery)
      ) {
        results.push(event);
      }
    }

    return sortEvents(results);
  }

  /**
   * 监听变更
   */
  onChange(callback: () => void): () => void {
    return this.eventEmitter.on('change', callback);
  }

  /**
   * 通知变更
   */
  private notifyChange(): void {
    this.eventEmitter.emitSync('change');
  }

  /**
   * 等待操作锁释放
   */
  private async waitForLock(): Promise<void> {
    while (this.operationLock) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number;
    upcoming: number;
    past: number;
  } {
    const now = new Date();
    let upcoming = 0;
    let past = 0;

    for (const event of this.events.values()) {
      if (event.start > now) {
        upcoming++;
      } else if (event.end < now) {
        past++;
      }
    }

    return {
      total: this.events.size,
      upcoming,
      past,
    };
  }

  /**
   * 销毁（清理资源）
   */
  destroy(): void {
    this.events.clear();
    this.eventEmitter.destroy();
  }
}

