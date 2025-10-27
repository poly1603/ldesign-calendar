/**
 * 虚拟滚动适配器 - 将虚拟滚动集成到日历视图
 * @module virtual-scroll-adapter
 */

import { VirtualScrollManager, VirtualScrollState } from './virtual-scroll';
import { CalendarEvent } from '../types';

export interface VirtualScrollAdapterConfig {
  /** 视图类型 */
  viewType: 'month' | 'week' | 'day' | 'agenda';
  /** 容器元素 */
  container: HTMLElement;
  /** 事件渲染函数 */
  renderEvent: (event: CalendarEvent, container: HTMLElement) => HTMLElement;
  /** 日期单元格渲染函数（月/周视图） */
  renderDateCell?: (date: Date, events: CalendarEvent[], container: HTMLElement) => HTMLElement;
  /** 时间槽渲染函数（日/周视图） */
  renderTimeSlot?: (time: Date, events: CalendarEvent[], container: HTMLElement) => HTMLElement;
}

export interface ViewportInfo {
  /** 可见的日期范围 */
  visibleDateRange: { start: Date; end: Date };
  /** 可见的事件 */
  visibleEvents: CalendarEvent[];
  /** 需要渲染的元素信息 */
  renderItems: RenderItem[];
}

export interface RenderItem {
  /** 渲染类型 */
  type: 'event' | 'date-cell' | 'time-slot';
  /** 索引 */
  index: number;
  /** 相关数据 */
  data: CalendarEvent | Date | { time: Date; events: CalendarEvent[] };
  /** 高度 */
  height: number;
  /** Y轴位置 */
  offsetY: number;
}

export class VirtualScrollAdapter {
  private config: VirtualScrollAdapterConfig;
  private virtualScroll: VirtualScrollManager | null = null;
  private scrollContainer: HTMLElement;
  private contentContainer: HTMLElement;
  private events: CalendarEvent[] = [];
  private renderItems: RenderItem[] = [];
  private renderedElements: Map<number, HTMLElement> = new Map();

  constructor(config: VirtualScrollAdapterConfig) {
    this.config = config;
    this.scrollContainer = this.createScrollContainer();
    this.contentContainer = this.createContentContainer();
    this.setupScrollListener();
  }

  /**
   * 创建滚动容器
   */
  private createScrollContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'ldesign-calendar-virtual-scroll';
    container.style.cssText = `
      position: relative;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    `;
    this.config.container.appendChild(container);
    return container;
  }

  /**
   * 创建内容容器
   */
  private createContentContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'ldesign-calendar-virtual-content';
    container.style.cssText = `
      position: relative;
      width: 100%;
    `;
    this.scrollContainer.appendChild(container);
    return container;
  }

  /**
   * 设置滚动监听
   */
  private setupScrollListener(): void {
    let scrollTimeout: number | null = null;

    this.scrollContainer.addEventListener('scroll', () => {
      if (this.virtualScroll) {
        this.virtualScroll.handleScroll(this.scrollContainer.scrollTop);

        // 延迟清理不可见元素
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        scrollTimeout = window.setTimeout(() => {
          this.cleanupInvisibleElements();
        }, 100);
      }
    });
  }

  /**
   * 初始化虚拟滚动
   */
  public initialize(events: CalendarEvent[], dateRange: { start: Date; end: Date }): void {
    this.events = events;
    this.renderItems = this.generateRenderItems(events, dateRange);

    const containerHeight = this.scrollContainer.clientHeight;
    const estimatedItemHeight = this.getEstimatedItemHeight();

    this.virtualScroll = new VirtualScrollManager({
      itemHeight: (index) => this.renderItems[index]?.height || estimatedItemHeight,
      buffer: 5,
      threshold: 100,
      containerHeight,
      totalItems: this.renderItems.length,
      estimatedItemHeight,
    });

    this.virtualScroll.onUpdate((state) => {
      this.handleVirtualScrollUpdate(state);
    });

    // 初始渲染
    const initialState = this.virtualScroll.getState();
    this.handleVirtualScrollUpdate(initialState);
  }

  /**
   * 生成渲染项目
   */
  private generateRenderItems(events: CalendarEvent[], dateRange: { start: Date; end: Date }): RenderItem[] {
    const items: RenderItem[] = [];
    let offsetY = 0;

    switch (this.config.viewType) {
      case 'month':
        items.push(...this.generateMonthViewItems(events, dateRange, offsetY));
        break;
      case 'week':
        items.push(...this.generateWeekViewItems(events, dateRange, offsetY));
        break;
      case 'day':
        items.push(...this.generateDayViewItems(events, dateRange, offsetY));
        break;
      case 'agenda':
        items.push(...this.generateAgendaViewItems(events, offsetY));
        break;
    }

    return items;
  }

  /**
   * 生成月视图项目
   */
  private generateMonthViewItems(
    events: CalendarEvent[],
    dateRange: { start: Date; end: Date },
    startOffset: number
  ): RenderItem[] {
    const items: RenderItem[] = [];
    const cellHeight = 120; // 月视图单元格高度
    const daysInView = 42; // 6周 * 7天
    let offsetY = startOffset;

    const startDate = new Date(dateRange.start);

    for (let i = 0; i < daysInView; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dayEvents = events.filter(event =>
        this.isEventOnDate(event, currentDate)
      );

      items.push({
        type: 'date-cell',
        index: items.length,
        data: { time: currentDate, events: dayEvents },
        height: cellHeight,
        offsetY,
      });

      // 每7个单元格（一周）增加行偏移
      if ((i + 1) % 7 === 0) {
        offsetY += cellHeight;
      }
    }

    return items;
  }

  /**
   * 生成周视图项目
   */
  private generateWeekViewItems(
    events: CalendarEvent[],
    dateRange: { start: Date; end: Date },
    startOffset: number
  ): RenderItem[] {
    const items: RenderItem[] = [];
    const slotHeight = 50; // 每小时高度
    const hoursPerDay = 24;
    let offsetY = startOffset;

    // 生成时间槽
    for (let hour = 0; hour < hoursPerDay; hour++) {
      const currentTime = new Date(dateRange.start);
      currentTime.setHours(hour, 0, 0, 0);

      const hourEvents = events.filter(event =>
        this.isEventInTimeSlot(event, currentTime, 60) // 60分钟时间槽
      );

      items.push({
        type: 'time-slot',
        index: items.length,
        data: { time: currentTime, events: hourEvents },
        height: slotHeight,
        offsetY,
      });

      offsetY += slotHeight;
    }

    return items;
  }

  /**
   * 生成日视图项目
   */
  private generateDayViewItems(
    events: CalendarEvent[],
    dateRange: { start: Date; end: Date },
    startOffset: number
  ): RenderItem[] {
    // 日视图与周视图类似，但只显示一天
    return this.generateWeekViewItems(
      events.filter(event => this.isEventOnDate(event, dateRange.start)),
      dateRange,
      startOffset
    );
  }

  /**
   * 生成议程视图项目
   */
  private generateAgendaViewItems(events: CalendarEvent[], startOffset: number): RenderItem[] {
    const items: RenderItem[] = [];
    const itemHeight = 80; // 议程项目高度
    let offsetY = startOffset;

    // 按开始时间排序
    const sortedEvents = [...events].sort((a, b) =>
      a.start.getTime() - b.start.getTime()
    );

    sortedEvents.forEach((event, index) => {
      items.push({
        type: 'event',
        index,
        data: event,
        height: itemHeight,
        offsetY,
      });
      offsetY += itemHeight;
    });

    return items;
  }

  /**
   * 处理虚拟滚动更新
   */
  private handleVirtualScrollUpdate(state: VirtualScrollState): void {
    // 更新容器高度
    this.contentContainer.style.height = `${state.totalHeight}px`;

    // 创建或更新可见元素
    const visibleIndexes = new Set(state.visibleItems);

    // 渲染新的可见元素
    state.visibleItems.forEach(index => {
      if (!this.renderedElements.has(index)) {
        const item = this.renderItems[index];
        if (item) {
          const element = this.renderItem(item);
          this.renderedElements.set(index, element);
          this.contentContainer.appendChild(element);
        }
      }
    });

    // 移除不再可见的元素
    this.renderedElements.forEach((element, index) => {
      if (!visibleIndexes.has(index)) {
        element.remove();
        this.renderedElements.delete(index);
      }
    });

    // 更新位置
    this.updateElementPositions();
  }

  /**
   * 渲染单个项目
   */
  private renderItem(item: RenderItem): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = `ldesign-calendar-virtual-item ldesign-calendar-virtual-item--${item.type}`;
    wrapper.style.cssText = `
      position: absolute;
      left: 0;
      right: 0;
      height: ${item.height}px;
      transform: translateY(${item.offsetY}px);
    `;
    wrapper.dataset.index = item.index.toString();

    switch (item.type) {
      case 'event':
        if (this.config.renderEvent) {
          this.config.renderEvent(item.data as CalendarEvent, wrapper);
        }
        break;
      case 'date-cell':
        if (this.config.renderDateCell) {
          const { time, events } = item.data as { time: Date; events: CalendarEvent[] };
          this.config.renderDateCell(time, events, wrapper);
        }
        break;
      case 'time-slot':
        if (this.config.renderTimeSlot) {
          const { time, events } = item.data as { time: Date; events: CalendarEvent[] };
          this.config.renderTimeSlot(time, events, wrapper);
        }
        break;
    }

    return wrapper;
  }

  /**
   * 更新元素位置
   */
  private updateElementPositions(): void {
    this.renderedElements.forEach((element, index) => {
      const item = this.renderItems[index];
      if (item) {
        element.style.transform = `translateY(${item.offsetY}px)`;
      }
    });
  }

  /**
   * 清理不可见元素
   */
  private cleanupInvisibleElements(): void {
    if (!this.virtualScroll) return;

    const state = this.virtualScroll.getState();
    const visibleIndexes = new Set(state.visibleItems);

    this.renderedElements.forEach((element, index) => {
      if (!visibleIndexes.has(index)) {
        element.remove();
        this.renderedElements.delete(index);
      }
    });
  }

  /**
   * 检查事件是否在指定日期
   */
  private isEventOnDate(event: CalendarEvent, date: Date): boolean {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return event.start <= endOfDay && event.end >= startOfDay;
  }

  /**
   * 检查事件是否在时间槽内
   */
  private isEventInTimeSlot(event: CalendarEvent, slotStart: Date, slotDurationMinutes: number): boolean {
    const slotEnd = new Date(slotStart.getTime() + slotDurationMinutes * 60 * 1000);
    return event.start < slotEnd && event.end > slotStart;
  }

  /**
   * 获取预估项目高度
   */
  private getEstimatedItemHeight(): number {
    switch (this.config.viewType) {
      case 'month':
        return 120;
      case 'week':
      case 'day':
        return 50;
      case 'agenda':
        return 80;
      default:
        return 60;
    }
  }

  /**
   * 滚动到指定日期
   */
  public scrollToDate(date: Date): void {
    if (!this.virtualScroll) return;

    // 找到对应日期的索引
    const index = this.renderItems.findIndex(item => {
      if (item.type === 'date-cell' || item.type === 'time-slot') {
        const itemDate = (item.data as { time: Date }).time;
        return itemDate.toDateString() === date.toDateString();
      }
      return false;
    });

    if (index !== -1) {
      const scrollTop = this.virtualScroll.scrollToIndex(index, 'start');
      this.scrollContainer.scrollTop = scrollTop;
    }
  }

  /**
   * 滚动到指定事件
   */
  public scrollToEvent(eventId: string): void {
    if (!this.virtualScroll) return;

    const index = this.renderItems.findIndex(item => {
      if (item.type === 'event') {
        return (item.data as CalendarEvent).id === eventId;
      }
      return false;
    });

    if (index !== -1) {
      const scrollTop = this.virtualScroll.scrollToIndex(index, 'center');
      this.scrollContainer.scrollTop = scrollTop;
    }
  }

  /**
   * 更新事件数据
   */
  public updateEvents(events: CalendarEvent[], dateRange: { start: Date; end: Date }): void {
    this.events = events;
    this.renderItems = this.generateRenderItems(events, dateRange);

    // 清理所有已渲染元素
    this.renderedElements.forEach(element => element.remove());
    this.renderedElements.clear();

    // 重新初始化
    if (this.virtualScroll) {
      this.virtualScroll.destroy();
    }

    this.initialize(events, dateRange);
  }

  /**
   * 销毁虚拟滚动适配器
   */
  public destroy(): void {
    if (this.virtualScroll) {
      this.virtualScroll.destroy();
    }

    this.renderedElements.forEach(element => element.remove());
    this.renderedElements.clear();

    this.scrollContainer.remove();
  }
}

/**
 * 创建虚拟滚动适配器
 */
export function createVirtualScrollAdapter(config: VirtualScrollAdapterConfig): VirtualScrollAdapter {
  return new VirtualScrollAdapter(config);
}


