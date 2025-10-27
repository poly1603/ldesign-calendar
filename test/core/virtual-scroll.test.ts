/**
 * 虚拟滚动系统测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VirtualScrollManager, createVirtualScroll } from '../../src/core/virtual-scroll';

describe('VirtualScrollManager', () => {
  let manager: VirtualScrollManager;
  let rafSpy: any;

  beforeEach(() => {
    // Mock requestAnimationFrame
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => {
      cb();
      return 1;
    });
  });

  afterEach(() => {
    if (manager) {
      manager.destroy();
    }
    rafSpy.mockRestore();
  });

  describe('初始化', () => {
    it('应该正确初始化固定高度项目', () => {
      manager = new VirtualScrollManager({
        itemHeight: 50,
        buffer: 2,
        threshold: 100,
        containerHeight: 500,
        totalItems: 100,
      });

      const state = manager.getState();
      expect(state.totalHeight).toBe(5000); // 100 * 50
      expect(state.startIndex).toBe(0);
      expect(state.endIndex).toBeGreaterThan(0);
      expect(state.visibleItems.length).toBeGreaterThan(0);
    });

    it('应该正确初始化动态高度项目', () => {
      manager = new VirtualScrollManager({
        itemHeight: (index) => 50 + index * 10,
        buffer: 2,
        threshold: 100,
        containerHeight: 500,
        totalItems: 10,
        estimatedItemHeight: 50,
      });

      const state = manager.getState();
      expect(state.totalHeight).toBeGreaterThan(0);
      expect(state.visibleItems.length).toBeGreaterThan(0);
    });
  });

  describe('滚动处理', () => {
    beforeEach(() => {
      manager = new VirtualScrollManager({
        itemHeight: 50,
        buffer: 2,
        threshold: 100,
        containerHeight: 500,
        totalItems: 100,
      });
    });

    it('应该正确处理滚动事件', () => {
      const updateCallback = vi.fn();
      manager.onUpdate(updateCallback);

      manager.handleScroll(200);
      
      expect(updateCallback).toHaveBeenCalled();
      const state = manager.getState();
      expect(state.scrollTop).toBe(200);
      expect(state.startIndex).toBeGreaterThan(0);
    });

    it('应该使用 RAF 优化滚动性能', () => {
      manager.handleScroll(100);
      manager.handleScroll(200);
      
      // 应该只触发一次 RAF
      expect(rafSpy).toHaveBeenCalledTimes(1);
    });

    it('应该正确计算可见范围', () => {
      manager.handleScroll(500); // 滚动到第10个项目
      
      const state = manager.getState();
      expect(state.startIndex).toBeGreaterThanOrEqual(8); // 考虑buffer
      expect(state.endIndex).toBeLessThanOrEqual(22); // 考虑buffer
    });
  });

  describe('项目高度更新', () => {
    beforeEach(() => {
      manager = new VirtualScrollManager({
        itemHeight: (index) => 50,
        buffer: 2,
        threshold: 100,
        containerHeight: 500,
        totalItems: 20,
      });
    });

    it('应该正确更新项目高度', () => {
      const initialHeight = manager.getState().totalHeight;
      
      manager.updateItemHeight(5, 100);
      
      const newHeight = manager.getState().totalHeight;
      expect(newHeight).toBeGreaterThan(initialHeight);
    });

    it('应该在可见范围内的项目更新时触发重新计算', () => {
      const updateCallback = vi.fn();
      manager.onUpdate(updateCallback);
      
      manager.handleScroll(250); // 滚动到包含第5个项目的位置
      updateCallback.mockClear();
      
      manager.updateItemHeight(5, 100);
      
      expect(updateCallback).toHaveBeenCalled();
    });
  });

  describe('滚动到指定位置', () => {
    beforeEach(() => {
      manager = new VirtualScrollManager({
        itemHeight: 50,
        buffer: 2,
        threshold: 100,
        containerHeight: 500,
        totalItems: 100,
      });
    });

    it('应该滚动到指定索引（start对齐）', () => {
      const scrollTop = manager.scrollToIndex(20, 'start');
      
      expect(scrollTop).toBe(1000); // 20 * 50
      expect(manager.getState().startIndex).toBeLessThanOrEqual(20);
    });

    it('应该滚动到指定索引（center对齐）', () => {
      const scrollTop = manager.scrollToIndex(20, 'center');
      
      // 应该将第20个项目居中
      const expectedTop = 20 * 50 + 25 - 250; // item top + item height/2 - container height/2
      expect(scrollTop).toBe(expectedTop);
    });

    it('应该滚动到指定索引（end对齐）', () => {
      const scrollTop = manager.scrollToIndex(20, 'end');
      
      // 应该将第20个项目底部对齐容器底部
      const expectedTop = 20 * 50 + 50 - 500; // item top + item height - container height
      expect(scrollTop).toBe(expectedTop);
    });

    it('应该限制滚动位置在有效范围内', () => {
      const scrollTop = manager.scrollToIndex(99, 'end');
      
      const maxScrollTop = manager.getState().totalHeight - 500;
      expect(scrollTop).toBeLessThanOrEqual(maxScrollTop);
    });
  });

  describe('配置更新', () => {
    beforeEach(() => {
      manager = new VirtualScrollManager({
        itemHeight: 50,
        buffer: 2,
        threshold: 100,
        containerHeight: 500,
        totalItems: 100,
      });
    });

    it('应该正确更新配置', () => {
      const updateCallback = vi.fn();
      manager.onUpdate(updateCallback);
      
      manager.updateConfig({
        containerHeight: 600,
        buffer: 3,
      });
      
      expect(updateCallback).toHaveBeenCalled();
      const state = manager.getState();
      expect(state.endIndex - state.startIndex).toBeGreaterThan(10); // 更多可见项目
    });
  });

  describe('资源清理', () => {
    it('应该正确清理资源', () => {
      manager = new VirtualScrollManager({
        itemHeight: 50,
        buffer: 2,
        threshold: 100,
        containerHeight: 500,
        totalItems: 100,
      });

      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
      
      manager.handleScroll(100);
      manager.destroy();
      
      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('工厂函数', () => {
    it('应该通过工厂函数创建实例', () => {
      const instance = createVirtualScroll({
        itemHeight: 50,
        buffer: 2,
        threshold: 100,
        containerHeight: 500,
        totalItems: 100,
      });
      
      expect(instance).toBeInstanceOf(VirtualScrollManager);
      expect(instance.getState().totalHeight).toBe(5000);
      
      instance.destroy();
    });
  });
});
