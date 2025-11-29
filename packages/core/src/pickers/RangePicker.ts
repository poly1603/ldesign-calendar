/**
 * RangePicker - 日期范围选择器核心逻辑
 * 提供日期范围选择功能
 */

import type { RangePickerOptions, Observer, Unsubscribe } from '../types';
import { DateUtil } from '../utils/date';
import { CalendarCore } from '../core/CalendarCore';

export class RangePicker {
  private selectedRange: { start: Date; end: Date } | null;
  private hoverDate: Date | null;
  private options: RangePickerOptions;
  private calendarCore: CalendarCore;
  private observers: Set<Observer<{ start: Date; end: Date } | null>>;

  constructor(options: RangePickerOptions = {}) {
    this.options = {
      format: 'YYYY-MM-DD',
      placeholder: 'Select date range',
      clearable: true,
      separator: ' ~ ',
      ...options,
    };

    this.selectedRange = null;
    this.hoverDate = null;
    this.observers = new Set();

    // 创建内部日历核心实例
    this.calendarCore = new CalendarCore({
      minDate: this.options.minDate,
      maxDate: this.options.maxDate,
      disabledDates: this.options.disabledDates,
    });
  }

  /**
   * 选择日期范围
   */
  selectRange(start: Date, end: Date): void {
    // 确保 start 在 end 之前
    if (DateUtil.isAfter(start, end)) {
      [start, end] = [end, start];
    }

    if (!this.isValidRange(start, end)) {
      console.warn('Invalid date range:', start, end);
      return;
    }

    this.selectedRange = {
      start: DateUtil.clone(start),
      end: DateUtil.clone(end),
    };

    this.calendarCore.selectRange(start, end);
    this.notify();
  }

  /**
   * 清除范围
   */
  clearRange(): void {
    this.selectedRange = null;
    this.hoverDate = null;
    this.calendarCore.clearSelection();
    this.notify();
  }

  /**
   * 获取选中的范围
   */
  getSelectedRange(): { start: Date; end: Date } | null {
    if (!this.selectedRange) {
      return null;
    }

    return {
      start: DateUtil.clone(this.selectedRange.start),
      end: DateUtil.clone(this.selectedRange.end),
    };
  }

  /**
   * 设置悬停日期（用于预览选择）
   */
  setHoverDate(date: Date | null): void {
    this.hoverDate = date ? DateUtil.clone(date) : null;
  }

  /**
   * 获取悬停日期
   */
  getHoverDate(): Date | null {
    return this.hoverDate ? DateUtil.clone(this.hoverDate) : null;
  }

  /**
   * 判断范围是否有效
   */
  isValidRange(start: Date, end: Date): boolean {
    // 检查开始日期
    if (!this.isDateValid(start)) {
      return false;
    }

    // 检查结束日期
    if (!this.isDateValid(end)) {
      return false;
    }

    // 检查最大范围
    if (this.options.maxRange) {
      const days = DateUtil.diffInDays(start, end);
      if (days > this.options.maxRange) {
        return false;
      }
    }

    // 检查最小范围
    if (this.options.minRange) {
      const days = DateUtil.diffInDays(start, end);
      if (days < this.options.minRange) {
        return false;
      }
    }

    return true;
  }

  /**
   * 判断单个日期是否有效
   */
  private isDateValid(date: Date): boolean {
    // 检查最小日期
    if (this.options.minDate && DateUtil.isBefore(date, this.options.minDate)) {
      return false;
    }

    // 检查最大日期
    if (this.options.maxDate && DateUtil.isAfter(date, this.options.maxDate)) {
      return false;
    }

    // 检查禁用日期
    if (this.options.disabledDates) {
      for (const disabledDate of this.options.disabledDates) {
        if (DateUtil.isSameDay(date, disabledDate)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 判断日期是否在选中范围内
   */
  isDateInRange(date: Date): boolean {
    if (!this.selectedRange) {
      return false;
    }

    return DateUtil.isBetween(date, this.selectedRange.start, this.selectedRange.end);
  }

  /**
   * 判断日期是否是范围的开始或结束
   */
  isRangeEdge(date: Date): 'start' | 'end' | null {
    if (!this.selectedRange) {
      return null;
    }

    if (DateUtil.isSameDay(date, this.selectedRange.start)) {
      return 'start';
    }

    if (DateUtil.isSameDay(date, this.selectedRange.end)) {
      return 'end';
    }

    return null;
  }

  /**
   * 格式化选中的范围
   */
  formatSelectedRange(): string {
    if (!this.selectedRange) {
      return '';
    }

    const startStr = DateUtil.format(this.selectedRange.start, this.options.format);
    const endStr = DateUtil.format(this.selectedRange.end, this.options.format);

    return `${startStr}${this.options.separator}${endStr}`;
  }

  /**
   * 获取范围的天数
   */
  getRangeDays(): number {
    if (!this.selectedRange) {
      return 0;
    }

    return DateUtil.diffInDays(this.selectedRange.start, this.selectedRange.end) + 1;
  }

  /**
   * 订阅范围变化
   */
  subscribe(observer: Observer<{ start: Date; end: Date } | null>): Unsubscribe {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }

  /**
   * 通知观察者
   */
  private notify(): void {
    this.observers.forEach(observer => observer(this.selectedRange));
  }

  /**
   * 更新配置
   */
  updateOptions(options: Partial<RangePickerOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };

    // 更新日历核心配置
    this.calendarCore.updateOptions({
      minDate: this.options.minDate,
      maxDate: this.options.maxDate,
      disabledDates: this.options.disabledDates,
    });
  }

  /**
   * 获取配置
   */
  getOptions(): RangePickerOptions {
    return { ...this.options };
  }

  /**
   * 获取日历核心实例
   */
  getCalendarCore(): CalendarCore {
    return this.calendarCore;
  }

  /**
   * 设置选中范围（不触发通知）
   */
  setSelectedRange(range: { start: Date; end: Date } | null): void {
    if (range) {
      this.selectedRange = {
        start: DateUtil.clone(range.start),
        end: DateUtil.clone(range.end),
      };
      this.calendarCore.selectRange(range.start, range.end);
    } else {
      this.selectedRange = null;
      this.calendarCore.clearSelection();
    }
  }

  /**
   * 解析日期范围字符串
   */
  parseRange(rangeStr: string): { start: Date; end: Date } | null {
    try {
      const parts = rangeStr.split(this.options.separator || ' ~ ');
      if (parts.length !== 2) {
        return null;
      }

      const start = DateUtil.parse(parts[0].trim(), this.options.format || 'YYYY-MM-DD');
      const end = DateUtil.parse(parts[1].trim(), this.options.format || 'YYYY-MM-DD');

      return { start, end };
    } catch (error) {
      console.error('Failed to parse range:', error);
      return null;
    }
  }

  /**
   * 快速选择预设范围
   */
  selectPreset(preset: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth'): void {
    const today = new Date();
    let start: Date;
    let end: Date;

    switch (preset) {
      case 'today':
        start = end = today;
        break;
      case 'yesterday':
        start = end = DateUtil.addDays(today, -1);
        break;
      case 'last7days':
        start = DateUtil.addDays(today, -6);
        end = today;
        break;
      case 'last30days':
        start = DateUtil.addDays(today, -29);
        end = today;
        break;
      case 'thisMonth':
        start = DateUtil.getStartOfMonth(today);
        end = DateUtil.getEndOfMonth(today);
        break;
      case 'lastMonth':
        const lastMonth = DateUtil.addMonths(today, -1);
        start = DateUtil.getStartOfMonth(lastMonth);
        end = DateUtil.getEndOfMonth(lastMonth);
        break;
      default:
        return;
    }

    this.selectRange(start, end);
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.observers.clear();
    this.calendarCore.destroy();
  }
}