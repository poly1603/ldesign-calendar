/**
 * @ldesign/calendar - API 适配器（预留接口）
 */

import type { CalendarEvent } from '../types';
import { BaseStorageAdapter } from './storage-adapter';

/**
 * API 配置
 */
export interface ApiConfig {
  baseUrl: string;
  endpoints?: {
    list?: string;
    create?: string;
    update?: string;
    delete?: string;
  };
  headers?: Record<string, string>;
  transform?: {
    request?: (data: any) => any;
    response?: (data: any) => any;
  };
}

/**
 * API 存储适配器
 */
export class ApiAdapter extends BaseStorageAdapter {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    super();
    this.config = {
      ...config,
      endpoints: {
        list: '/events',
        create: '/events',
        update: '/events/:id',
        delete: '/events/:id',
        ...config.endpoints,
      },
    };
  }

  async save(events: CalendarEvent[]): Promise<void> {
    // 批量保存不常用，这里抛出提示
    throw new Error('批量保存不支持，请使用 create/update/delete 方法');
  }

  async load(): Promise<CalendarEvent[]> {
    try {
      const url = `${this.config.baseUrl}${this.config.endpoints!.list}`;
      const response = await fetch(url, {
        headers: this.config.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data = await response.json();

      // 应用响应转换
      if (this.config.transform?.response) {
        data = this.config.transform.response(data);
      }

      return this.deserializeEvents(data);
    } catch (error) {
      console.error('Failed to load events from API:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    // 清除所有事件通常需要特殊权限，这里抛出提示
    throw new Error('清除所有事件需要特殊实现');
  }

  async create(event: CalendarEvent): Promise<void> {
    try {
      const url = `${this.config.baseUrl}${this.config.endpoints!.create}`;
      let data: any = this.serializeEvents([event])[0];

      // 应用请求转换
      if (this.config.transform?.request) {
        data = this.config.transform.request(data);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<CalendarEvent>): Promise<void> {
    try {
      const url = `${this.config.baseUrl}${this.config.endpoints!.update!.replace(':id', id)}`;
      let data: any = updates;

      // 序列化日期
      if (updates.start) {
        data = { ...data, start: updates.start.toISOString() };
      }
      if (updates.end) {
        data = { ...data, end: updates.end.toISOString() };
      }

      // 应用请求转换
      if (this.config.transform?.request) {
        data = this.config.transform.request(data);
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const url = `${this.config.baseUrl}${this.config.endpoints!.delete!.replace(':id', id)}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.config.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  }
}

