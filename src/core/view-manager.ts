/**
 * @ldesign/calendar - 视图管理器
 */

import type { CalendarView, ViewConfig, DateRange, Weekday } from '../types';
import {
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
} from '../utils/date-utils';
import { VirtualScrollAdapter, VirtualScrollAdapterConfig } from './virtual-scroll-adapter';
import { CalendarEvent } from '../types';

/**
 * 视图管理器
 */
export class ViewManager {
  private currentView: CalendarView;
  private currentDate: Date;
  private firstDayOfWeek: Weekday;
  private virtualScrollAdapter: VirtualScrollAdapter | null = null;
  private virtualScrollEnabled: boolean = false;
  private container: HTMLElement | null = null;

  constructor(initialView: CalendarView = 'month' as CalendarView, initialDate?: Date, firstDayOfWeek?: Weekday) {
    this.currentView = initialView;
    this.currentDate = initialDate || new Date();
    this.firstDayOfWeek = firstDayOfWeek || 0;
  }

  /**
   * 获取当前视图
   */
  getCurrentView(): CalendarView {
    return this.currentView;
  }


  /**
   * 获取当前日期
   */
  getCurrentDate(): Date {
    return this.currentDate;
  }

  /**
   * 设置当前日期
   */
  setCurrentDate(date: Date): void {
    this.currentDate = date;
  }

  /**
   * 跳转到今天
   */
  today(): void {
    this.currentDate = new Date();
  }

  /**
   * 下一个周期
   */
  next(): void {
    switch (this.currentView) {
      case 'month':
        this.currentDate = addMonths(this.currentDate, 1);
        break;
      case 'week':
        this.currentDate = addWeeks(this.currentDate, 1);
        break;
      case 'day':
        this.currentDate = addDays(this.currentDate, 1);
        break;
    }
  }

  /**
   * 上一个周期
   */
  prev(): void {
    switch (this.currentView) {
      case 'month':
        this.currentDate = addMonths(this.currentDate, -1);
        break;
      case 'week':
        this.currentDate = addWeeks(this.currentDate, -1);
        break;
      case 'day':
        this.currentDate = addDays(this.currentDate, -1);
        break;
    }
  }

  /**
   * 获取视图日期范围
   */
  getDateRange(): DateRange {
    switch (this.currentView) {
      case 'month':
        return {
          start: startOfMonth(this.currentDate),
          end: endOfMonth(this.currentDate),
        };
      case 'week':
        return {
          start: startOfWeek(this.currentDate, this.firstDayOfWeek),
          end: endOfWeek(this.currentDate, this.firstDayOfWeek),
        };
      case 'day':
        return {
          start: startOfDay(this.currentDate),
          end: endOfDay(this.currentDate),
        };
      case 'agenda':
        // 议程视图显示未来30天
        return {
          start: startOfDay(this.currentDate),
          end: addDays(this.currentDate, 30),
        };
      default:
        return {
          start: startOfMonth(this.currentDate),
          end: endOfMonth(this.currentDate),
        };
    }
  }

  /**
   * 获取视图配置
   */
  getViewConfig(): ViewConfig {
    return {
      type: this.currentView,
      currentDate: this.currentDate,
      dateRange: this.getDateRange(),
    };
  }

  /**
   * 启用虚拟滚动
   */
  enableVirtualScroll(container: HTMLElement, config: Partial<VirtualScrollAdapterConfig>): void {
    this.container = container;
    this.virtualScrollEnabled = true;

    // 如果已存在虚拟滚动适配器，先销毁
    if (this.virtualScrollAdapter) {
      this.virtualScrollAdapter.destroy();
    }

    // 创建新的虚拟滚动适配器
    this.virtualScrollAdapter = new VirtualScrollAdapter({
      ...config,
      viewType: this.currentView,
      container,
    } as VirtualScrollAdapterConfig);
  }

  /**
   * 禁用虚拟滚动
   */
  disableVirtualScroll(): void {
    this.virtualScrollEnabled = false;
    if (this.virtualScrollAdapter) {
      this.virtualScrollAdapter.destroy();
      this.virtualScrollAdapter = null;
    }
  }

  /**
   * 更新虚拟滚动事件
   */
  updateVirtualScrollEvents(events: CalendarEvent[]): void {
    if (this.virtualScrollAdapter && this.virtualScrollEnabled) {
      this.virtualScrollAdapter.updateEvents(events, this.getDateRange());
    }
  }

  /**
   * 初始化虚拟滚动
   */
  initializeVirtualScroll(events: CalendarEvent[]): void {
    if (this.virtualScrollAdapter && this.virtualScrollEnabled) {
      this.virtualScrollAdapter.initialize(events, this.getDateRange());
    }
  }

  /**
   * 滚动到指定日期
   */
  scrollToDate(date: Date): void {
    if (this.virtualScrollAdapter && this.virtualScrollEnabled) {
      this.virtualScrollAdapter.scrollToDate(date);
    }
  }

  /**
   * 滚动到指定事件
   */
  scrollToEvent(eventId: string): void {
    if (this.virtualScrollAdapter && this.virtualScrollEnabled) {
      this.virtualScrollAdapter.scrollToEvent(eventId);
    }
  }

  /**
   * 获取虚拟滚动是否启用
   */
  isVirtualScrollEnabled(): boolean {
    return this.virtualScrollEnabled;
  }

  /**
   * 切换视图时更新虚拟滚动
   */
  private updateVirtualScrollForView(): void {
    if (this.virtualScrollAdapter && this.virtualScrollEnabled && this.container) {
      // 重新创建适配器以匹配新视图
      const config = {
        viewType: this.currentView,
        container: this.container,
        // 保留原有的渲染函数
        renderEvent: (this.virtualScrollAdapter as any).config.renderEvent,
        renderDateCell: (this.virtualScrollAdapter as any).config.renderDateCell,
        renderTimeSlot: (this.virtualScrollAdapter as any).config.renderTimeSlot,
      };

      this.virtualScrollAdapter.destroy();
      this.virtualScrollAdapter = new VirtualScrollAdapter(config);
    }
  }

  /**
   * 重写 setCurrentView 以支持虚拟滚动
   */
  setCurrentView(view: CalendarView): void {
    const oldView = this.currentView;
    this.currentView = view;

    // 如果视图改变，更新虚拟滚动
    if (oldView !== view) {
      this.updateVirtualScrollForView();
    }
  }

  /**
   * 销毁视图管理器
   */
  destroy(): void {
    if (this.virtualScrollAdapter) {
      this.virtualScrollAdapter.destroy();
      this.virtualScrollAdapter = null;
    }
  }
}

