/**
 * 缓存管理器 - 智能缓存和预加载机制
 * @module cache-manager
 */

import type { CalendarEvent } from '../types';

export interface CacheConfig {
  /** 最大缓存条目数 */
  maxSize?: number;
  /** 缓存过期时间（毫秒） */
  ttl?: number;
  /** 是否启用预加载 */
  enablePreload?: boolean;
  /** 预加载时间范围（天） */
  preloadDays?: number;
  /** 是否持久化到 localStorage */
  persistent?: boolean;
  /** localStorage 键名前缀 */
  storagePrefix?: string;
}

export interface CacheEntry<T> {
  /** 缓存数据 */
  data: T;
  /** 创建时间 */
  timestamp: number;
  /** 访问次数 */
  accessCount: number;
  /** 最后访问时间 */
  lastAccess: number;
  /** 数据大小（字节） */
  size: number;
}

export interface CacheStats {
  /** 缓存命中次数 */
  hits: number;
  /** 缓存未命中次数 */
  misses: number;
  /** 缓存条目数 */
  entries: number;
  /** 缓存总大小（字节） */
  totalSize: number;
  /** 命中率 */
  hitRate: number;
}

export class CacheManager<T = any> {
  private config: Required<CacheConfig>;
  private cache: Map<string, CacheEntry<T>> = new Map();
  private accessOrder: string[] = [];
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    entries: 0,
    totalSize: 0,
    hitRate: 0,
  };
  private preloadQueue: Set<string> = new Set();
  private preloadInProgress: Set<string> = new Set();

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      ttl: config.ttl || 3600000, // 1小时
      enablePreload: config.enablePreload !== false,
      preloadDays: config.preloadDays || 7,
      persistent: config.persistent || false,
      storagePrefix: config.storagePrefix || 'ldesign-calendar-cache',
    };

    if (this.config.persistent) {
      this.loadFromStorage();
    }
  }

  /**
   * 生成缓存键
   */
  public generateKey(params: Record<string, any>): string {
    return JSON.stringify(params, Object.keys(params).sort());
  }

  /**
   * 生成日期范围键
   */
  public generateDateRangeKey(start: Date, end: Date, extra?: Record<string, any>): string {
    return this.generateKey({
      start: start.toISOString(),
      end: end.toISOString(),
      ...extra,
    });
  }

  /**
   * 获取缓存数据
   */
  public get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // 检查是否过期
    if (this.isExpired(entry)) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // 更新访问信息
    entry.accessCount++;
    entry.lastAccess = Date.now();

    // 更新访问顺序
    this.updateAccessOrder(key);

    this.stats.hits++;
    this.updateHitRate();

    return entry.data;
  }

  /**
   * 设置缓存数据
   */
  public set(key: string, data: T): void {
    const size = this.estimateSize(data);

    // 如果超过最大大小，执行LRU清理
    while (this.cache.size >= this.config.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now(),
      size,
    };

    this.cache.set(key, entry);
    this.accessOrder.push(key);

    // 更新统计
    this.stats.entries = this.cache.size;
    this.stats.totalSize += size;

    // 持久化
    if (this.config.persistent) {
      this.saveToStorage(key, entry);
    }

    // 触发预加载
    if (this.config.enablePreload) {
      this.schedulePreload(key, data);
    }
  }

  /**
   * 删除缓存数据
   */
  public delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }

    // 更新统计
    this.stats.entries = this.cache.size;
    this.stats.totalSize -= entry.size;

    // 从持久化存储中删除
    if (this.config.persistent) {
      this.removeFromStorage(key);
    }

    return true;
  }

  /**
   * 清空缓存
   */
  public clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.stats = {
      hits: 0,
      misses: 0,
      entries: 0,
      totalSize: 0,
      hitRate: 0,
    };

    if (this.config.persistent) {
      this.clearStorage();
    }
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.config.ttl;
  }

  /**
   * 更新访问顺序
   */
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  /**
   * LRU 清理
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;

    const lruKey = this.accessOrder[0];
    this.delete(lruKey);
  }

  /**
   * 估算数据大小
   */
  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // UTF-16 编码
    } catch {
      return 1024; // 默认 1KB
    }
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * 预加载调度
   */
  private schedulePreload(key: string, data: T): void {
    // 对于事件数据，预加载相邻时间段
    if (Array.isArray(data) && data.length > 0 && this.isEventArray(data)) {
      const events = data as unknown as CalendarEvent[];
      const dates = this.extractDateRangeFromKey(key);

      if (dates) {
        // 预加载前后时间段
        const preloadRanges = this.generatePreloadRanges(dates.start, dates.end);
        preloadRanges.forEach(range => {
          const preloadKey = this.generateDateRangeKey(range.start, range.end);
          if (!this.cache.has(preloadKey) && !this.preloadInProgress.has(preloadKey)) {
            this.preloadQueue.add(preloadKey);
          }
        });
      }
    }
  }

  /**
   * 检查是否是事件数组
   */
  private isEventArray(data: any[]): data is CalendarEvent[] {
    return data.length > 0 && 'start' in data[0] && 'end' in data[0];
  }

  /**
   * 从缓存键提取日期范围
   */
  private extractDateRangeFromKey(key: string): { start: Date; end: Date } | null {
    try {
      const params = JSON.parse(key);
      if (params.start && params.end) {
        return {
          start: new Date(params.start),
          end: new Date(params.end),
        };
      }
    } catch {
      // 忽略解析错误
    }
    return null;
  }

  /**
   * 生成预加载范围
   */
  private generatePreloadRanges(start: Date, end: Date): Array<{ start: Date; end: Date }> {
    const ranges: Array<{ start: Date; end: Date }> = [];
    const duration = end.getTime() - start.getTime();

    // 预加载前一个时间段
    ranges.push({
      start: new Date(start.getTime() - duration),
      end: new Date(start.getTime()),
    });

    // 预加载后一个时间段
    ranges.push({
      start: new Date(end.getTime()),
      end: new Date(end.getTime() + duration),
    });

    return ranges;
  }

  /**
   * 执行预加载
   */
  public async preload(loader: (key: string) => Promise<T>): Promise<void> {
    const keysToPreload = Array.from(this.preloadQueue);
    this.preloadQueue.clear();

    // 并行预加载
    const promises = keysToPreload.map(async (key) => {
      if (this.preloadInProgress.has(key)) return;

      this.preloadInProgress.add(key);
      try {
        const data = await loader(key);
        if (data) {
          this.set(key, data);
        }
      } catch (error) {
        console.error('Preload error:', error);
      } finally {
        this.preloadInProgress.delete(key);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * 获取缓存统计
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 持久化到 localStorage
   */
  private saveToStorage(key: string, entry: CacheEntry<T>): void {
    if (!this.config.persistent || typeof localStorage === 'undefined') return;

    try {
      const storageKey = `${this.config.storagePrefix}:${key}`;
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  /**
   * 从 localStorage 加载
   */
  private loadFromStorage(): void {
    if (!this.config.persistent || typeof localStorage === 'undefined') return;

    try {
      const prefix = `${this.config.storagePrefix}:`;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const cacheKey = key.substring(prefix.length);
          const value = localStorage.getItem(key);

          if (value) {
            const entry = JSON.parse(value) as CacheEntry<T>;
            if (!this.isExpired(entry)) {
              this.cache.set(cacheKey, entry);
              this.accessOrder.push(cacheKey);
              this.stats.entries++;
              this.stats.totalSize += entry.size;
            } else {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }
  }

  /**
   * 从 localStorage 删除
   */
  private removeFromStorage(key: string): void {
    if (!this.config.persistent || typeof localStorage === 'undefined') return;

    try {
      const storageKey = `${this.config.storagePrefix}:${key}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  /**
   * 清空 localStorage
   */
  private clearStorage(): void {
    if (!this.config.persistent || typeof localStorage === 'undefined') return;

    try {
      const prefix = `${this.config.storagePrefix}:`;
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  /**
   * 获取缓存大小信息
   */
  public getSizeInfo(): {
    entries: number;
    totalSize: number;
    averageSize: number;
    largestEntry: { key: string; size: number } | null;
  } {
    let largestEntry: { key: string; size: number } | null = null;

    this.cache.forEach((entry, key) => {
      if (!largestEntry || entry.size > largestEntry.size) {
        largestEntry = { key, size: entry.size };
      }
    });

    return {
      entries: this.stats.entries,
      totalSize: this.stats.totalSize,
      averageSize: this.stats.entries > 0 ? this.stats.totalSize / this.stats.entries : 0,
      largestEntry,
    };
  }

  /**
   * 缓存预热
   */
  public async warmup(
    dateRanges: Array<{ start: Date; end: Date }>,
    loader: (start: Date, end: Date) => Promise<T>
  ): Promise<void> {
    const promises = dateRanges.map(async ({ start, end }) => {
      const key = this.generateDateRangeKey(start, end);
      if (!this.cache.has(key)) {
        try {
          const data = await loader(start, end);
          if (data) {
            this.set(key, data);
          }
        } catch (error) {
          console.error('Warmup error:', error);
        }
      }
    });

    await Promise.allSettled(promises);
  }
}

/**
 * 创建事件缓存管理器
 */
export function createEventCacheManager(config?: CacheConfig): CacheManager<CalendarEvent[]> {
  return new CacheManager<CalendarEvent[]>(config);
}

/**
 * 创建通用缓存管理器
 */
export function createCacheManager<T>(config?: CacheConfig): CacheManager<T> {
  return new CacheManager<T>(config);
}

