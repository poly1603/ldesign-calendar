/**
 * @ldesign/calendar - LocalStorage 适配器
 */

import type { CalendarEvent } from '../types';
import { BaseStorageAdapter } from './storage-adapter';

/**
 * LocalStorage 存储适配器
 */
export class LocalStorageAdapter extends BaseStorageAdapter {
  private key: string;

  constructor(key: string = 'ldesign-calendar-events') {
    super();
    this.key = key;
  }

  async save(events: CalendarEvent[]): Promise<void> {
    try {
      const serialized = this.serializeEvents(events);
      localStorage.setItem(this.key, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to save events to localStorage:', error);
      throw error;
    }
  }

  async load(): Promise<CalendarEvent[]> {
    try {
      const data = localStorage.getItem(this.key);

      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);
      return this.deserializeEvents(parsed);
    } catch (error) {
      console.error('Failed to load events from localStorage:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      throw error;
    }
  }

  /**
   * 获取存储大小（字节）
   */
  getStorageSize(): number {
    const data = localStorage.getItem(this.key);
    return data ? new Blob([data]).size : 0;
  }

  /**
   * 检查是否有存储空间
   */
  hasStorage(): boolean {
    try {
      const testKey = '__ldesign_calendar_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

