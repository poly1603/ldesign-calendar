/**
 * 日历组件性能测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { performance } from 'perf_hooks';
import { createCalendar } from '../../src/index';
import { VirtualScrollManager } from '../../src/core/virtual-scroll';
import { CacheManager } from '../../src/core/cache-manager';
import { WorkerManager } from '../../src/core/worker-manager';
import type { CalendarEvent } from '../../src/types';

// 性能基准配置
const PERFORMANCE_THRESHOLDS = {
  initialization: 100, // 初始化时间（毫秒）
  render: 16, // 单帧渲染时间（毫秒）
  eventCreation: 5, // 创建单个事件（毫秒）
  batchEventCreation: 100, // 批量创建100个事件（毫秒）
  search: 50, // 搜索1000个事件（毫秒）
  virtualScroll: 10, // 虚拟滚动更新（毫秒）
  cacheHit: 1, // 缓存命中（毫秒）
  memoryUsage: 50 * 1024 * 1024, // 最大内存使用（50MB）
};

// 生成测试事件
function generateEvents(count: number, startDate: Date = new Date()): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(i / 10));
    date.setHours(9 + (i % 8));
    
    events.push({
      id: `event-${i}`,
      title: `Event ${i} - ${Math.random().toString(36).substring(7)}`,
      description: `Description for event ${i}. This is a longer text to simulate real content.`,
      location: i % 3 === 0 ? `Room ${i % 10}` : undefined,
      start: new Date(date),
      end: new Date(date.getTime() + 3600000 * (1 + Math.random())),
      allDay: i % 10 === 0,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      extendedProps: {
        category: ['meeting', 'task', 'reminder'][i % 3],
        priority: (i % 5) + 1,
        attendees: Array(Math.floor(Math.random() * 10)).fill(0).map((_, j) => `user${j}@example.com`),
      },
    });
  }
  
  return events;
}

// 测量执行时间
async function measureTime<T>(fn: () => T | Promise<T>): Promise<{ result: T; time: number }> {
  const start = performance.now();
  const result = await fn();
  const time = performance.now() - start;
  return { result, time };
}

// 测量内存使用
function measureMemory(): number {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage().heapUsed;
  }
  // 浏览器环境
  if (typeof (performance as any).memory !== 'undefined') {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
}

describe('日历性能测试', () => {
  let container: HTMLElement;
  
  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'calendar-test';
    document.body.appendChild(container);
  });
  
  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('初始化性能', () => {
    it('应该快速初始化空日历', async () => {
      const { time } = await measureTime(() => {
        return createCalendar('#calendar-test', {
          initialView: 'month',
        });
      });
      
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.initialization);
    });

    it('应该快速初始化带事件的日历', async () => {
      const events = generateEvents(100);
      
      const { time } = await measureTime(() => {
        const calendar = createCalendar('#calendar-test', {
          initialView: 'month',
        });
        
        events.forEach(event => calendar.addEvent(event));
        return calendar;
      });
      
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.initialization * 2);
    });
  });

  describe('虚拟滚动性能', () => {
    it('应该快速处理大量项目的滚动', async () => {
      const manager = new VirtualScrollManager({
        itemHeight: 50,
        buffer: 5,
        threshold: 100,
        containerHeight: 500,
        totalItems: 10000,
      });
      
      const scrollPositions = [0, 1000, 5000, 9000, 500];
      const times: number[] = [];
      
      for (const position of scrollPositions) {
        const { time } = await measureTime(() => {
          manager.handleScroll(position);
        });
        times.push(time);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLDS.virtualScroll);
      
      manager.destroy();
    });

    it('应该高效管理动态高度项目', async () => {
      const manager = new VirtualScrollManager({
        itemHeight: (index) => 50 + (index % 3) * 20,
        buffer: 5,
        threshold: 100,
        containerHeight: 500,
        totalItems: 5000,
        estimatedItemHeight: 60,
      });
      
      // 测试滚动到不同位置
      const { time } = await measureTime(() => {
        for (let i = 0; i < 100; i++) {
          manager.handleScroll(i * 50);
        }
      });
      
      expect(time / 100).toBeLessThan(PERFORMANCE_THRESHOLDS.virtualScroll);
      
      manager.destroy();
    });
  });

  describe('事件管理性能', () => {
    it('应该快速添加单个事件', async () => {
      const calendar = createCalendar('#calendar-test');
      const event = generateEvents(1)[0];
      
      const { time } = await measureTime(async () => {
        await calendar.addEvent(event);
      });
      
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.eventCreation);
    });

    it('应该高效批量添加事件', async () => {
      const calendar = createCalendar('#calendar-test');
      const events = generateEvents(100);
      
      const { time } = await measureTime(async () => {
        for (const event of events) {
          await calendar.addEvent(event);
        }
      });
      
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.batchEventCreation);
    });

    it('应该处理10000+事件而不卡顿', async () => {
      const calendar = createCalendar('#calendar-test', {
        virtualScroll: true, // 启用虚拟滚动
      });
      
      const events = generateEvents(10000);
      const memoryBefore = measureMemory();
      
      const { time } = await measureTime(async () => {
        // 批量添加
        const batchSize = 100;
        for (let i = 0; i < events.length; i += batchSize) {
          const batch = events.slice(i, i + batchSize);
          await Promise.all(batch.map(e => calendar.addEvent(e)));
        }
      });
      
      const memoryAfter = measureMemory();
      const memoryUsed = memoryAfter - memoryBefore;
      
      expect(time).toBeLessThan(10000); // 10秒内完成
      expect(memoryUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage);
    });
  });

  describe('缓存性能', () => {
    it('应该快速命中缓存', async () => {
      const cache = new CacheManager<CalendarEvent[]>({
        maxSize: 1000,
        ttl: 3600000,
      });
      
      const events = generateEvents(100);
      const key = 'test-key';
      
      // 设置缓存
      cache.set(key, events);
      
      // 测量缓存命中时间
      const { time } = await measureTime(() => {
        return cache.get(key);
      });
      
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.cacheHit);
      
      // 验证缓存统计
      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.hitRate).toBe(1);
      
      cache.clear();
    });

    it('应该高效执行LRU清理', async () => {
      const cache = new CacheManager<any>({
        maxSize: 100,
        ttl: 3600000,
      });
      
      // 填满缓存并触发LRU
      const { time } = await measureTime(() => {
        for (let i = 0; i < 200; i++) {
          cache.set(`key-${i}`, { data: `value-${i}` });
        }
      });
      
      expect(time).toBeLessThan(100); // 100ms内完成
      expect(cache.getStats().entries).toBe(100); // 保持最大大小
      
      cache.clear();
    });
  });

  describe('搜索性能', () => {
    it('应该快速搜索大量事件', async () => {
      const { SearchPanel } = await import('../../src/components/search-panel');
      const searchPanel = new SearchPanel({
        enableRegex: true,
        maxResults: 100,
      });
      
      const events = generateEvents(1000);
      searchPanel.buildIndex(events);
      
      const { result, time } = await measureTime(() => {
        return searchPanel.searchImmediate(events, {
          text: 'Event 5',
        });
      });
      
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.search);
      expect(result.events.length).toBeGreaterThan(0);
    });

    it('应该高效过滤事件', async () => {
      const { SearchPanel } = await import('../../src/components/search-panel');
      const searchPanel = new SearchPanel();
      
      const events = generateEvents(5000);
      
      const { result, time } = await measureTime(() => {
        return searchPanel.searchImmediate(events, {
          filters: [{
            id: 'priority-high',
            name: '高优先级',
            type: 'select',
            field: 'extendedProps.priority',
            operator: 'gte',
            value: 4,
            active: true,
          }],
        });
      });
      
      expect(time).toBeLessThan(PERFORMANCE_THRESHOLDS.search * 2);
      expect(result.events.length).toBeGreaterThan(0);
    });
  });

  describe('Worker性能', () => {
    it('应该通过Worker加速事件处理', async () => {
      const workerManager = new WorkerManager({
        poolSize: 4,
        enabled: true,
      });
      
      const events = generateEvents(1000);
      
      const { result, time } = await measureTime(() => {
        return workerManager.processEvents(events, {
          start: new Date(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }, {
          expandRecurrence: true,
          detectConflicts: true,
          calculatePositions: true,
          viewType: 'week',
        });
      });
      
      expect(time).toBeLessThan(1000); // 1秒内完成
      expect(result.length).toBeGreaterThan(0);
      
      workerManager.terminate();
    });

    it('应该高效管理Worker池', async () => {
      const workerManager = new WorkerManager({
        poolSize: 4,
        taskTimeout: 5000,
      });
      
      // 并发执行多个任务
      const tasks = Array(20).fill(0).map((_, i) => {
        const events = generateEvents(50);
        return workerManager.processEvents(events, {
          start: new Date(),
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      });
      
      const { time } = await measureTime(() => Promise.all(tasks));
      
      // 验证并行执行效率
      expect(time).toBeLessThan(2000); // 2秒内完成20个任务
      
      const status = workerManager.getPoolStatus();
      expect(status.totalWorkers).toBe(4);
      
      workerManager.terminate();
    });
  });

  describe('内存管理', () => {
    it('应该避免内存泄漏', async () => {
      const initialMemory = measureMemory();
      
      // 创建和销毁多个日历实例
      for (let i = 0; i < 10; i++) {
        const calendar = createCalendar('#calendar-test');
        const events = generateEvents(100);
        
        for (const event of events) {
          await calendar.addEvent(event);
        }
        
        calendar.destroy();
      }
      
      // 强制垃圾回收（如果可用）
      if (typeof global !== 'undefined' && typeof global.gc === 'function') {
        global.gc();
      }
      
      const finalMemory = measureMemory();
      const memoryIncrease = finalMemory - initialMemory;
      
      // 内存增长应该很小
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 小于10MB
    });
  });

  describe('渲染性能', () => {
    it('应该保持60fps渲染', async () => {
      const calendar = createCalendar('#calendar-test', {
        initialView: 'month',
      });
      
      const events = generateEvents(100);
      events.forEach(e => calendar.addEvent(e));
      
      // 模拟连续渲染
      const frames = 60;
      const frameTimes: number[] = [];
      
      for (let i = 0; i < frames; i++) {
        const { time } = await measureTime(() => {
          // 触发重新渲染
          calendar.render();
        });
        frameTimes.push(time);
      }
      
      // 计算平均帧时间
      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frames;
      
      // 应该保持在16ms以内（60fps）
      expect(avgFrameTime).toBeLessThan(PERFORMANCE_THRESHOLDS.render);
    });
  });

  describe('综合性能基准', () => {
    it('应该通过综合性能测试', async () => {
      const results = {
        initialization: 0,
        eventManagement: 0,
        rendering: 0,
        interaction: 0,
        memory: 0,
      };
      
      // 1. 初始化
      const { time: initTime } = await measureTime(() => {
        return createCalendar('#calendar-test', {
          initialView: 'month',
          virtualScroll: true,
          cacheEnabled: true,
        });
      });
      results.initialization = initTime;
      
      const calendar = createCalendar('#calendar-test');
      
      // 2. 事件管理
      const events = generateEvents(500);
      const { time: eventTime } = await measureTime(async () => {
        for (const event of events) {
          await calendar.addEvent(event);
        }
      });
      results.eventManagement = eventTime;
      
      // 3. 渲染性能
      const { time: renderTime } = await measureTime(() => {
        for (let i = 0; i < 10; i++) {
          calendar.render();
        }
      });
      results.rendering = renderTime / 10;
      
      // 4. 交互性能
      const { time: interactionTime } = await measureTime(() => {
        // 模拟视图切换
        calendar.changeView('week');
        calendar.changeView('day');
        calendar.changeView('month');
        
        // 模拟导航
        calendar.next();
        calendar.prev();
        calendar.today();
      });
      results.interaction = interactionTime;
      
      // 5. 内存使用
      results.memory = measureMemory();
      
      // 验证性能指标
      expect(results.initialization).toBeLessThan(100);
      expect(results.eventManagement).toBeLessThan(500);
      expect(results.rendering).toBeLessThan(16);
      expect(results.interaction).toBeLessThan(100);
      expect(results.memory).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage);
      
      // 生成性能报告
      console.log('性能测试结果:');
      console.log(`- 初始化时间: ${results.initialization.toFixed(2)}ms`);
      console.log(`- 事件管理(500个): ${results.eventManagement.toFixed(2)}ms`);
      console.log(`- 单帧渲染: ${results.rendering.toFixed(2)}ms`);
      console.log(`- 交互响应: ${results.interaction.toFixed(2)}ms`);
      console.log(`- 内存使用: ${(results.memory / 1024 / 1024).toFixed(2)}MB`);
    });
  });
});
