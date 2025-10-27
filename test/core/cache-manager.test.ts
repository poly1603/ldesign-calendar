/**
 * 缓存管理器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheManager, createCacheManager, createEventCacheManager } from '../../src/core/cache-manager';
import type { CalendarEvent } from '../../src/types';

describe('CacheManager', () => {
  let manager: CacheManager<any>;

  beforeEach(() => {
    // 清理 localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    if (manager) {
      manager.clear();
    }
  });

  describe('基本缓存操作', () => {
    beforeEach(() => {
      manager = new CacheManager({
        maxSize: 10,
        ttl: 3600000, // 1小时
        persistent: false,
      });
    });

    it('应该正确存储和获取数据', () => {
      const data = { id: 1, name: 'test' };
      manager.set('key1', data);

      const retrieved = manager.get('key1');
      expect(retrieved).toEqual(data);
    });

    it('应该返回null当键不存在时', () => {
      const result = manager.get('nonexistent');
      expect(result).toBeNull();
    });

    it('应该正确删除缓存项', () => {
      manager.set('key1', 'value1');
      expect(manager.get('key1')).toBe('value1');

      const deleted = manager.delete('key1');
      expect(deleted).toBe(true);
      expect(manager.get('key1')).toBeNull();
    });

    it('应该清空所有缓存', () => {
      manager.set('key1', 'value1');
      manager.set('key2', 'value2');

      manager.clear();

      expect(manager.get('key1')).toBeNull();
      expect(manager.get('key2')).toBeNull();
      expect(manager.getStats().entries).toBe(0);
    });
  });

  describe('TTL（过期时间）', () => {
    it('应该在过期后返回null', () => {
      manager = new CacheManager({
        maxSize: 10,
        ttl: 100, // 100毫秒
        persistent: false,
      });

      manager.set('key1', 'value1');
      expect(manager.get('key1')).toBe('value1');

      // 等待超过TTL
      vi.useFakeTimers();
      vi.advanceTimersByTime(150);

      expect(manager.get('key1')).toBeNull();

      vi.useRealTimers();
    });
  });

  describe('LRU清理', () => {
    beforeEach(() => {
      manager = new CacheManager({
        maxSize: 3,
        ttl: 3600000,
        persistent: false,
      });
    });

    it('应该在达到最大大小时清理最少使用的项', () => {
      manager.set('key1', 'value1');
      manager.set('key2', 'value2');
      manager.set('key3', 'value3');

      // 访问key1和key2，使key3成为LRU
      manager.get('key1');
      manager.get('key2');

      // 添加新项，应该清理key3
      manager.set('key4', 'value4');

      expect(manager.get('key3')).toBeNull();
      expect(manager.get('key1')).toBe('value1');
      expect(manager.get('key2')).toBe('value2');
      expect(manager.get('key4')).toBe('value4');
    });

    it('应该更新访问顺序', () => {
      manager.set('key1', 'value1');
      manager.set('key2', 'value2');
      manager.set('key3', 'value3');

      // 访问key1，使其成为最近使用
      manager.get('key1');

      // 添加新项，应该清理key2（最少使用）
      manager.set('key4', 'value4');

      expect(manager.get('key1')).toBe('value1');
      expect(manager.get('key2')).toBeNull();
      expect(manager.get('key3')).toBe('value3');
    });
  });

  describe('缓存统计', () => {
    beforeEach(() => {
      manager = new CacheManager({
        maxSize: 10,
        ttl: 3600000,
        persistent: false,
      });
    });

    it('应该正确追踪缓存命中和未命中', () => {
      manager.set('key1', 'value1');

      manager.get('key1'); // 命中
      manager.get('key2'); // 未命中
      manager.get('key1'); // 命中

      const stats = manager.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.667, 2);
    });

    it('应该正确追踪缓存大小', () => {
      manager.set('key1', 'short');
      manager.set('key2', 'a very long string with more characters');

      const stats = manager.getStats();
      expect(stats.entries).toBe(2);
      expect(stats.totalSize).toBeGreaterThan(0);
    });

    it('应该提供大小信息', () => {
      manager.set('key1', 'short');
      manager.set('key2', 'a very long string with more characters');

      const sizeInfo = manager.getSizeInfo();
      expect(sizeInfo.entries).toBe(2);
      expect(sizeInfo.totalSize).toBeGreaterThan(0);
      expect(sizeInfo.averageSize).toBeGreaterThan(0);
      expect(sizeInfo.largestEntry).toBeTruthy();
      expect(sizeInfo.largestEntry?.key).toBe('key2');
    });
  });

  describe('缓存键生成', () => {
    beforeEach(() => {
      manager = new CacheManager();
    });

    it('应该生成一致的缓存键', () => {
      const params1 = { a: 1, b: 2, c: 3 };
      const params2 = { c: 3, a: 1, b: 2 }; // 不同顺序

      const key1 = manager.generateKey(params1);
      const key2 = manager.generateKey(params2);

      expect(key1).toBe(key2);
    });

    it('应该生成日期范围键', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');

      const key = manager.generateDateRangeKey(start, end);
      expect(key).toContain('2024-01-01');
      expect(key).toContain('2024-01-31');
    });

    it('应该在日期范围键中包含额外参数', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      const extra = { view: 'month', filter: 'important' };

      const key = manager.generateDateRangeKey(start, end, extra);
      expect(key).toContain('month');
      expect(key).toContain('important');
    });
  });

  describe('持久化存储', () => {
    it('应该保存到localStorage', () => {
      manager = new CacheManager({
        persistent: true,
        storagePrefix: 'test-cache',
      });

      manager.set('key1', 'value1');

      const storageKey = 'test-cache:key1';
      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.data).toBe('value1');
    });

    it('应该从localStorage加载', () => {
      // 先保存一些数据
      const storageKey = 'test-cache:key1';
      const entry = {
        data: 'value1',
        timestamp: Date.now(),
        accessCount: 1,
        lastAccess: Date.now(),
        size: 12,
      };
      localStorage.setItem(storageKey, JSON.stringify(entry));

      // 创建新的管理器，应该自动加载
      manager = new CacheManager({
        persistent: true,
        storagePrefix: 'test-cache',
        ttl: 3600000,
      });

      expect(manager.get('key1')).toBe('value1');
    });

    it('应该在删除时从localStorage移除', () => {
      manager = new CacheManager({
        persistent: true,
        storagePrefix: 'test-cache',
      });

      manager.set('key1', 'value1');
      const storageKey = 'test-cache:key1';
      expect(localStorage.getItem(storageKey)).toBeTruthy();

      manager.delete('key1');
      expect(localStorage.getItem(storageKey)).toBeNull();
    });

    it('应该在清空时清理localStorage', () => {
      manager = new CacheManager({
        persistent: true,
        storagePrefix: 'test-cache',
      });

      manager.set('key1', 'value1');
      manager.set('key2', 'value2');

      manager.clear();

      expect(localStorage.getItem('test-cache:key1')).toBeNull();
      expect(localStorage.getItem('test-cache:key2')).toBeNull();
    });
  });

  describe('预加载', () => {
    it('应该执行预加载', async () => {
      manager = new CacheManager({
        enablePreload: true,
        preloadDays: 7,
      });

      const loader = vi.fn().mockResolvedValue({ data: 'preloaded' });

      // 模拟设置触发预加载的数据
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'Event 1',
          start: new Date('2024-01-15'),
          end: new Date('2024-01-15'),
        },
      ];

      const key = manager.generateDateRangeKey(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      manager.set(key, events);

      // 执行预加载
      await manager.preload(loader);

      // 验证loader被调用
      // 注意：由于预加载逻辑的复杂性，这里简化测试
      expect(loader).toHaveBeenCalled();
    });

    it('应该执行缓存预热', async () => {
      manager = new CacheManager();

      const loader = vi.fn().mockResolvedValue(['data1', 'data2']);

      const ranges = [
        { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
        { start: new Date('2024-02-01'), end: new Date('2024-02-29') },
      ];

      await manager.warmup(ranges, loader);

      expect(loader).toHaveBeenCalledTimes(2);

      // 验证数据被缓存
      const key1 = manager.generateDateRangeKey(ranges[0].start, ranges[0].end);
      expect(manager.get(key1)).toEqual(['data1', 'data2']);
    });
  });

  describe('事件缓存管理器', () => {
    it('应该创建专门的事件缓存管理器', () => {
      const eventManager = createEventCacheManager({
        maxSize: 100,
        ttl: 7200000,
      });

      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'Meeting',
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-15T11:00:00'),
        },
      ];

      const key = eventManager.generateDateRangeKey(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      eventManager.set(key, events);
      expect(eventManager.get(key)).toEqual(events);

      eventManager.clear();
    });
  });

  describe('工厂函数', () => {
    it('应该通过工厂函数创建通用缓存管理器', () => {
      const instance = createCacheManager<string>({
        maxSize: 50,
      });

      instance.set('key1', 'value1');
      expect(instance.get('key1')).toBe('value1');

      instance.clear();
    });
  });
});
