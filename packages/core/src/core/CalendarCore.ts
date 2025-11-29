/**
 * CalendarCore - 日历核心状态管理
 * 整合所有模块，提供统一的日历功能接口
 */

import type {
  CalendarOptions,
  CalendarState,
  ViewMode,
  MonthViewData,
  WeekViewData,
  DayViewData,
  Observer,
  Unsubscribe,
} from '../types';
import { DateUtil } from '../utils/date';
import { LunarCalendar } from '../utils/lunar';
import { I18n } from '../i18n/I18n';
import { HolidayManager } from './HolidayManager';
import { EventManager } from './EventManager';
import { ThemeManager } from './ThemeManager';

export class CalendarCore {
  private state: CalendarState;
  private options: CalendarOptions;
  private observers: Set<Observer<CalendarState>>;

  // 子模块
  public readonly eventManager: EventManager;
  public readonly holidayManager: HolidayManager;
  public readonly themeManager: ThemeManager;
  public readonly i18n: I18n;

  constructor(options: CalendarOptions = {}) {
    // 初始化配置
    this.options = {
      defaultDate: new Date(),
      viewMode: 'month',
      firstDayOfWeek: 1,
      showWeekNumber: false,
      showLunar: false,
      locale: 'zh-CN',
      ...options,
    };

    // 初始化状态
    this.state = {
      currentDate: this.options.defaultDate || new Date(),
      selectedDate: null,
      selectedRange: null,
      viewMode: this.options.viewMode || 'month',
      showWeekNumber: this.options.showWeekNumber || false,
      showLunar: this.options.showLunar || false,
      firstDayOfWeek: this.options.firstDayOfWeek || 1,
    };

    // 初始化观察者
    this.observers = new Set();

    // 初始化子模块
    this.eventManager = new EventManager();
    this.holidayManager = new HolidayManager();
    this.themeManager = new ThemeManager();
    this.i18n = new I18n(this.options.locale);

    // 订阅子模块变化
    this.eventManager.subscribe(() => this.notify());
  }

  /**
   * 获取当前状态
   */
  getState(): CalendarState {
    return { ...this.state };
  }

  /**
   * 设置状态
   */
  setState(updates: Partial<CalendarState>): void {
    this.state = {
      ...this.state,
      ...updates,
    };
    this.notify();
  }

  /**
   * 订阅状态变化
   */
  subscribe(observer: Observer<CalendarState>): Unsubscribe {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }

  /**
   * 通知所有观察者
   */
  private notify(): void {
    this.observers.forEach(observer => observer(this.getState()));
  }

  // ============================================================================
  // 日期导航
  // ============================================================================

  /**
   * 跳转到指定日期
   */
  goToDate(date: Date): void {
    this.setState({ currentDate: date });
  }

  /**
   * 跳转到今天
   */
  goToToday(): void {
    this.goToDate(new Date());
  }

  /**
   * 下一个月
   */
  nextMonth(): void {
    const nextDate = DateUtil.addMonths(this.state.currentDate, 1);
    this.goToDate(nextDate);
  }

  /**
   * 上一个月
   */
  prevMonth(): void {
    const prevDate = DateUtil.addMonths(this.state.currentDate, -1);
    this.goToDate(prevDate);
  }

  /**
   * 下一周
   */
  nextWeek(): void {
    const nextDate = DateUtil.addDays(this.state.currentDate, 7);
    this.goToDate(nextDate);
  }

  /**
   * 上一周
   */
  prevWeek(): void {
    const prevDate = DateUtil.addDays(this.state.currentDate, -7);
    this.goToDate(prevDate);
  }

  /**
   * 下一天
   */
  nextDay(): void {
    const nextDate = DateUtil.addDays(this.state.currentDate, 1);
    this.goToDate(nextDate);
  }

  /**
   * 上一天
   */
  prevDay(): void {
    const prevDate = DateUtil.addDays(this.state.currentDate, -1);
    this.goToDate(prevDate);
  }

  /**
   * 下一年
   */
  nextYear(): void {
    const nextDate = DateUtil.addYears(this.state.currentDate, 1);
    this.goToDate(nextDate);
  }

  /**
   * 上一年
   */
  prevYear(): void {
    const prevDate = DateUtil.addYears(this.state.currentDate, -1);
    this.goToDate(prevDate);
  }

  // ============================================================================
  // 视图切换
  // ============================================================================

  /**
   * 设置视图模式
   */
  setViewMode(mode: ViewMode): void {
    this.setState({ viewMode: mode });
  }

  /**
   * 切换到月视图
   */
  toMonthView(): void {
    this.setViewMode('month');
  }

  /**
   * 切换到周视图
   */
  toWeekView(): void {
    this.setViewMode('week');
  }

  /**
   * 切换到日视图
   */
  toDayView(): void {
    this.setViewMode('day');
  }

  // ============================================================================
  // 日期选择
  // ============================================================================

  /**
   * 选择日期
   */
  selectDate(date: Date): void {
    if (!this.isDateSelectable(date)) {
      console.warn('Date is not selectable:', date);
      return;
    }

    this.setState({
      selectedDate: date,
      selectedRange: null, // 清除范围选择
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

    if (!this.isDateSelectable(start) || !this.isDateSelectable(end)) {
      console.warn('Date range is not selectable:', start, end);
      return;
    }

    this.setState({
      selectedDate: null, // 清除单日选择
      selectedRange: { start, end },
    });
  }

  /**
   * 清除选择
   */
  clearSelection(): void {
    this.setState({
      selectedDate: null,
      selectedRange: null,
    });
  }

  /**
   * 判断日期是否被选中
   */
  isDateSelected(date: Date): boolean {
    if (this.state.selectedDate) {
      return DateUtil.isSameDay(date, this.state.selectedDate);
    }
    return false;
  }

  /**
   * 判断日期是否在选中范围内
   */
  isDateInSelectedRange(date: Date): boolean {
    if (this.state.selectedRange) {
      return DateUtil.isBetween(
        date,
        this.state.selectedRange.start,
        this.state.selectedRange.end
      );
    }
    return false;
  }

  // ============================================================================
  // 日期禁用判断
  // ============================================================================

  /**
   * 判断日期是否被禁用
   */
  isDateDisabled(date: Date): boolean {
    // 检查最小日期
    if (this.options.minDate && DateUtil.isBefore(date, this.options.minDate)) {
      return true;
    }

    // 检查最大日期
    if (this.options.maxDate && DateUtil.isAfter(date, this.options.maxDate)) {
      return true;
    }

    // 检查禁用日期列表
    if (this.options.disabledDates) {
      for (const disabledDate of this.options.disabledDates) {
        if (DateUtil.isSameDay(date, disabledDate)) {
          return true;
        }
      }
    }

    // 检查禁用星期
    if (this.options.disabledWeekdays) {
      const dayOfWeek = date.getDay();
      if (this.options.disabledWeekdays.includes(dayOfWeek)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 判断日期是否可选
   */
  isDateSelectable(date: Date): boolean {
    return !this.isDateDisabled(date);
  }

  // ============================================================================
  // 配置管理
  // ============================================================================

  /**
   * 更新配置
   */
  updateOptions(options: Partial<CalendarOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };

    // 更新相关状态
    if (options.firstDayOfWeek !== undefined) {
      this.setState({ firstDayOfWeek: options.firstDayOfWeek });
    }
    if (options.showWeekNumber !== undefined) {
      this.setState({ showWeekNumber: options.showWeekNumber });
    }
    if (options.showLunar !== undefined) {
      this.setState({ showLunar: options.showLunar });
    }
    if (options.locale) {
      this.i18n.setLocale(options.locale);
    }
  }

  /**
   * 获取配置
   */
  getOptions(): CalendarOptions {
    return { ...this.options };
  }

  /**
   * 设置是否显示周数
   */
  setShowWeekNumber(show: boolean): void {
    this.setState({ showWeekNumber: show });
  }

  /**
   * 设置是否显示农历
   */
  setShowLunar(show: boolean): void {
    this.setState({ showLunar: show });
  }

  /**
   * 设置一周的第一天
   */
  setFirstDayOfWeek(day: 0 | 1): void {
    this.setState({ firstDayOfWeek: day });
  }

  /**
   * 设置语言
   */
  setLocale(locale: string): void {
    this.i18n.setLocale(locale);
    this.notify();
  }

  // ============================================================================
  // 辅助方法
  // ============================================================================

  /**
   * 获取当前月份信息
   */
  getCurrentMonth(): { year: number; month: number } {
    return {
      year: this.state.currentDate.getFullYear(),
      month: this.state.currentDate.getMonth(),
    };
  }

  /**
   * 获取当前年份
   */
  getCurrentYear(): number {
    return this.state.currentDate.getFullYear();
  }

  /**
   * 获取农历信息
   */
  getLunarInfo(date: Date) {
    return LunarCalendar.solarToLunar(date);
  }

  /**
   * 格式化日期
   */
  formatDate(date: Date, format?: string): string {
    return DateUtil.format(date, format);
  }

  /**
   * 判断是否为今天
   */
  isToday(date: Date): boolean {
    return DateUtil.isToday(date);
  }

  /**
   * 判断是否为周末
   */
  isWeekend(date: Date): boolean {
    return DateUtil.isWeekend(date);
  }

  /**
   * 获取当前视图的日期范围
   */
  getCurrentViewRange(): { start: Date; end: Date } {
    const { currentDate, viewMode, firstDayOfWeek } = this.state;

    switch (viewMode) {
      case 'month': {
        const start = DateUtil.getStartOfMonth(currentDate);
        const end = DateUtil.getEndOfMonth(currentDate);
        return { start, end };
      }
      case 'week': {
        const start = DateUtil.getStartOfWeek(currentDate, firstDayOfWeek);
        const end = DateUtil.getEndOfWeek(currentDate, firstDayOfWeek);
        return { start, end };
      }
      case 'day': {
        const start = DateUtil.getStartOfDay(currentDate);
        const end = DateUtil.getEndOfDay(currentDate);
        return { start, end };
      }
      default:
        return { start: currentDate, end: currentDate };
    }
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.observers.clear();
  }

  /**
   * 克隆实例
   */
  clone(): CalendarCore {
    const cloned = new CalendarCore(this.options);
    cloned.setState(this.state);
    return cloned;
  }
}