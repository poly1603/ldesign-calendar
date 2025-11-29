/**
 * DatePicker - 日期选择器核心逻辑
 * 提供单日期选择功能
 */

import type { DatePickerOptions, Observer, Unsubscribe } from '../types';
import { DateUtil } from '../utils/date';
import { CalendarCore } from '../core/CalendarCore';

export class DatePicker {
  private selectedDate: Date | null;
  private options: DatePickerOptions;
  private calendarCore: CalendarCore;
  private observers: Set<Observer<Date | null>>;

  constructor(options: DatePickerOptions = {}) {
    this.options = {
      format: 'YYYY-MM-DD',
      placeholder: 'Select date',
      clearable: true,
      ...options,
    };

    this.selectedDate = null;
    this.observers = new Set();

    // 创建内部日历核心实例
    this.calendarCore = new CalendarCore({
      minDate: this.options.minDate,
      maxDate: this.options.maxDate,
      disabledDates: this.options.disabledDates,
    });
  }

  /**
   * 选择日期
   */
  selectDate(date: Date): void {
    if (!this.isDateValid(date)) {
      console.warn('Invalid date:', date);
      return;
    }

    this.selectedDate = DateUtil.clone(date);
    this.calendarCore.selectDate(date);
    this.notify();
  }

  /**
   * 清除日期
   */
  clearDate(): void {
    this.selectedDate = null;
    this.calendarCore.clearSelection();
    this.notify();
  }

  /**
   * 获取选中的日期
   */
  getSelectedDate(): Date | null {
    return this.selectedDate ? DateUtil.clone(this.selectedDate) : null;
  }

  /**
   * 格式化选中的日期
   */
  formatSelectedDate(): string {
    if (!this.selectedDate) {
      return '';
    }

    return DateUtil.format(this.selectedDate, this.options.format);
  }

  /**
   * 判断日期是否有效
   */
  isDateValid(date: Date): boolean {
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
   * 订阅日期变化
   */
  subscribe(observer: Observer<Date | null>): Unsubscribe {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }

  /**
   * 通知观察者
   */
  private notify(): void {
    this.observers.forEach(observer => observer(this.selectedDate));
  }

  /**
   * 更新配置
   */
  updateOptions(options: Partial<DatePickerOptions>): void {
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
  getOptions(): DatePickerOptions {
    return { ...this.options };
  }

  /**
   * 获取日历核心实例
   */
  getCalendarCore(): CalendarCore {
    return this.calendarCore;
  }

  /**
   * 设置选中日期（不触发通知）
   */
  setSelectedDate(date: Date | null): void {
    this.selectedDate = date ? DateUtil.clone(date) : null;
    if (date) {
      this.calendarCore.selectDate(date);
    } else {
      this.calendarCore.clearSelection();
    }
  }

  /**
   * 解析日期字符串
   */
  parseDate(dateStr: string): Date | null {
    try {
      return DateUtil.parse(dateStr, this.options.format || 'YYYY-MM-DD');
    } catch (error) {
      console.error('Failed to parse date:', error);
      return null;
    }
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.observers.clear();
    this.calendarCore.destroy();
  }
}