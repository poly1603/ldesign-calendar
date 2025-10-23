/**
 * @ldesign/calendar - 存储适配器接口
 */

import type { CalendarEvent, StorageAdapter } from '../types';

/**
 * 基础存储适配器抽象类
 */
export abstract class BaseStorageAdapter implements StorageAdapter {
  abstract save(events: CalendarEvent[]): Promise<void>;
  abstract load(): Promise<CalendarEvent[]>;
  abstract clear(): Promise<void>;

  async create(event: CalendarEvent): Promise<void> {
    const events = await this.load();
    events.push(event);
    await this.save(events);
  }

  async update(id: string, updates: Partial<CalendarEvent>): Promise<void> {
    const events = await this.load();
    const index = events.findIndex(e => e.id === id);

    if (index !== -1) {
      events[index] = { ...events[index], ...updates };
      await this.save(events);
    }
  }

  async delete(id: string): Promise<void> {
    const events = await this.load();
    const filtered = events.filter(e => e.id !== id);
    await this.save(filtered);
  }

  /**
   * 序列化事件（将 Date 转换为 string）
   */
  protected serializeEvents(events: CalendarEvent[]): any[] {
    return events.map(event => ({
      ...event,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      recurrence: event.recurrence ? {
        ...event.recurrence,
        until: event.recurrence.until?.toISOString(),
      } : undefined,
    }));
  }

  /**
   * 反序列化事件（将 string 转换为 Date）
   */
  protected deserializeEvents(data: any[]): CalendarEvent[] {
    return data.map(item => ({
      ...item,
      start: new Date(item.start),
      end: new Date(item.end),
      recurrence: item.recurrence ? {
        ...item.recurrence,
        until: item.recurrence.until ? new Date(item.recurrence.until) : undefined,
      } : undefined,
    }));
  }
}

