/**
 * 虚拟滚动系统 - 支持大量事件的高性能渲染
 * @module virtual-scroll
 */

export interface VirtualScrollConfig {
  /** 项目高度，可以是固定值或动态计算函数 */
  itemHeight: number | ((index: number) => number);
  /** 缓冲区大小（渲染可视区域外的额外项目数） */
  buffer: number;
  /** 滚动触发阈值（距离边缘多少像素时开始更新） */
  threshold: number;
  /** 容器高度 */
  containerHeight: number;
  /** 总项目数 */
  totalItems: number;
  /** 预估的项目高度（用于动态高度的初始计算） */
  estimatedItemHeight?: number;
}

export interface VirtualScrollState {
  /** 当前滚动位置 */
  scrollTop: number;
  /** 可视区域的起始索引 */
  startIndex: number;
  /** 可视区域的结束索引 */
  endIndex: number;
  /** 虚拟滚动容器的总高度 */
  totalHeight: number;
  /** 顶部占位高度 */
  offsetTop: number;
  /** 底部占位高度 */
  offsetBottom: number;
  /** 可见项目列表 */
  visibleItems: number[];
}

export class VirtualScrollManager {
  private config: VirtualScrollConfig;
  private state: VirtualScrollState;
  private itemHeightCache: Map<number, number> = new Map();
  private scrollRAF: number | null = null;
  private updateCallback?: (state: VirtualScrollState) => void;

  constructor(config: VirtualScrollConfig) {
    this.config = config;
    this.state = {
      scrollTop: 0,
      startIndex: 0,
      endIndex: 0,
      totalHeight: 0,
      offsetTop: 0,
      offsetBottom: 0,
      visibleItems: [],
    };

    this.calculateInitialState();
  }

  /**
   * 计算初始状态
   */
  private calculateInitialState(): void {
    const { containerHeight, totalItems, buffer } = this.config;
    const itemHeight = this.getItemHeight(0);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(visibleCount + buffer * 2, totalItems - 1);

    this.state = {
      scrollTop: 0,
      startIndex: 0,
      endIndex,
      totalHeight: this.calculateTotalHeight(),
      offsetTop: 0,
      offsetBottom: 0,
      visibleItems: this.generateVisibleItems(0, endIndex),
    };
  }

  /**
   * 获取项目高度
   */
  private getItemHeight(index: number): number {
    if (typeof this.config.itemHeight === 'function') {
      // 使用缓存避免重复计算
      if (!this.itemHeightCache.has(index)) {
        const height = this.config.itemHeight(index);
        this.itemHeightCache.set(index, height);
        return height;
      }
      return this.itemHeightCache.get(index)!;
    }
    return this.config.itemHeight;
  }

  /**
   * 计算总高度
   */
  private calculateTotalHeight(): number {
    const { totalItems, itemHeight, estimatedItemHeight } = this.config;

    if (typeof itemHeight === 'number') {
      return totalItems * itemHeight;
    }

    // 对于动态高度，使用已知高度 + 预估高度
    let totalHeight = 0;
    for (let i = 0; i < totalItems; i++) {
      if (this.itemHeightCache.has(i)) {
        totalHeight += this.itemHeightCache.get(i)!;
      } else {
        totalHeight += estimatedItemHeight || 50;
      }
    }

    return totalHeight;
  }

  /**
   * 计算可见范围
   */
  private calculateVisibleRange(scrollTop: number): { start: number; end: number } {
    const { containerHeight, totalItems, buffer } = this.config;

    let accumulatedHeight = 0;
    let startIndex = 0;

    // 找到起始索引
    for (let i = 0; i < totalItems; i++) {
      const itemHeight = this.getItemHeight(i);
      if (accumulatedHeight + itemHeight > scrollTop) {
        startIndex = Math.max(0, i - buffer);
        break;
      }
      accumulatedHeight += itemHeight;
    }

    // 计算结束索引
    accumulatedHeight = 0;
    let endIndex = startIndex;
    for (let i = startIndex; i < totalItems; i++) {
      if (accumulatedHeight > containerHeight + buffer * this.getItemHeight(i)) {
        break;
      }
      accumulatedHeight += this.getItemHeight(i);
      endIndex = i;
    }

    return {
      start: startIndex,
      end: Math.min(endIndex + buffer, totalItems - 1),
    };
  }

  /**
   * 计算偏移量
   */
  private calculateOffsets(startIndex: number, endIndex: number): { top: number; bottom: number } {
    let offsetTop = 0;
    let offsetBottom = 0;

    // 计算顶部偏移
    for (let i = 0; i < startIndex; i++) {
      offsetTop += this.getItemHeight(i);
    }

    // 计算底部偏移
    for (let i = endIndex + 1; i < this.config.totalItems; i++) {
      offsetBottom += this.getItemHeight(i);
    }

    return { top: offsetTop, bottom: offsetBottom };
  }

  /**
   * 生成可见项目列表
   */
  private generateVisibleItems(startIndex: number, endIndex: number): number[] {
    const items: number[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push(i);
    }
    return items;
  }

  /**
   * 处理滚动事件
   */
  public handleScroll(scrollTop: number): void {
    // 使用 RAF 优化滚动性能
    if (this.scrollRAF) {
      cancelAnimationFrame(this.scrollRAF);
    }

    this.scrollRAF = requestAnimationFrame(() => {
      this.updateScrollPosition(scrollTop);
      this.scrollRAF = null;
    });
  }

  /**
   * 更新滚动位置
   */
  private updateScrollPosition(scrollTop: number): void {
    const { start, end } = this.calculateVisibleRange(scrollTop);

    // 只在范围变化时更新
    if (start !== this.state.startIndex || end !== this.state.endIndex) {
      const { top, bottom } = this.calculateOffsets(start, end);

      this.state = {
        scrollTop,
        startIndex: start,
        endIndex: end,
        totalHeight: this.calculateTotalHeight(),
        offsetTop: top,
        offsetBottom: bottom,
        visibleItems: this.generateVisibleItems(start, end),
      };

      // 触发更新回调
      if (this.updateCallback) {
        this.updateCallback(this.state);
      }
    }
  }

  /**
   * 更新项目高度
   */
  public updateItemHeight(index: number, height: number): void {
    const oldHeight = this.itemHeightCache.get(index);
    if (oldHeight !== height) {
      this.itemHeightCache.set(index, height);
      this.state.totalHeight = this.calculateTotalHeight();

      // 如果更新的项目在可见范围内，触发重新计算
      if (index >= this.state.startIndex && index <= this.state.endIndex) {
        this.updateScrollPosition(this.state.scrollTop);
      }
    }
  }

  /**
   * 滚动到指定索引
   */
  public scrollToIndex(index: number, alignment: 'start' | 'center' | 'end' = 'start'): number {
    let scrollTop = 0;

    // 计算目标位置
    for (let i = 0; i < index; i++) {
      scrollTop += this.getItemHeight(i);
    }

    // 根据对齐方式调整
    const itemHeight = this.getItemHeight(index);
    if (alignment === 'center') {
      scrollTop += itemHeight / 2 - this.config.containerHeight / 2;
    } else if (alignment === 'end') {
      scrollTop += itemHeight - this.config.containerHeight;
    }

    // 确保在有效范围内
    scrollTop = Math.max(0, Math.min(scrollTop, this.state.totalHeight - this.config.containerHeight));

    this.updateScrollPosition(scrollTop);
    return scrollTop;
  }

  /**
   * 设置更新回调
   */
  public onUpdate(callback: (state: VirtualScrollState) => void): void {
    this.updateCallback = callback;
  }

  /**
   * 获取当前状态
   */
  public getState(): VirtualScrollState {
    return { ...this.state };
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<VirtualScrollConfig>): void {
    this.config = { ...this.config, ...config };
    this.calculateInitialState();

    if (this.updateCallback) {
      this.updateCallback(this.state);
    }
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    if (this.scrollRAF) {
      cancelAnimationFrame(this.scrollRAF);
    }
    this.itemHeightCache.clear();
    this.updateCallback = undefined;
  }
}

/**
 * 创建虚拟滚动管理器的工厂函数
 */
export function createVirtualScroll(config: VirtualScrollConfig): VirtualScrollManager {
  return new VirtualScrollManager(config);
}


