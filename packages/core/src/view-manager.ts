/**
 * @ldesign/calendar-core - 视图管理器
 */

import type { CalendarView, ViewConfig, DateRange, Weekday } from './types';
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
} from './utils/date';

/**
 * 视图管理器
 */
export class ViewManager {
  private currentView: CalendarView;
  private currentDate: Date;
  private firstDayOfWeek: Weekday;

  constructor(
    initialView: CalendarView = 'month',
    initialDate?: Date,
    firstDayOfWeek: Weekday = 0
  ) {
    this.currentView = initialView;
    this.currentDate = initialDate || new Date();
    this.firstDayOfWeek = firstDayOfWeek;
  }

  /**
   * 获取当前视图
   */
  getCurrentView(): CalendarView {
    return this.currentView;
  }

  /**
   * 设置当前视图
   */
  setCurrentView(view: CalendarView): void {
    this.currentView = view;
  }

  /**
   * 获取当前日期
   */
  getCurrentDate(): Date {
    return new Date(this.currentDate);
  }

  /**
   * 设置当前日期
   */
  setCurrentDate(date: Date): void {
    this.currentDate = new Date(date);
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
      case 'agenda':
        this.currentDate = addDays(this.currentDate, 30);
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
      case 'agenda':
        this.currentDate = addDays(this.currentDate, -30);
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
      currentDate: this.getCurrentDate(),
      dateRange: this.getDateRange(),
    };
  }
}

