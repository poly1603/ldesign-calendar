/**
 * ViewStrategy - 视图渲染策略基类和实现
 * 负责生成不同视图所需的数据结构
 */

import type {
  DayCell,
  WeekRow,
  MonthViewData,
  WeekViewData,
  DayViewData,
  HourSlot,
  CalendarEvent,
} from '../types';
import { DateUtil } from '../utils/date';
import { LunarCalendar } from '../utils/lunar';
import type { CalendarCore } from '../core/CalendarCore';

/**
 * 视图策略抽象类
 */
export abstract class ViewStrategy {
  protected calendar: CalendarCore;

  constructor(calendar: CalendarCore) {
    this.calendar = calendar;
  }

  /**
   * 生成视图数据
   */
  abstract generateViewData(date: Date): MonthViewData | WeekViewData | DayViewData;

  /**
   * 创建日期单元格
   */
  protected createDayCell(date: Date, isCurrentMonth: boolean = true): DayCell {
    const state = this.calendar.getState();
    const events = this.calendar.eventManager.getEventsOnDate(date);
    const holiday = this.calendar.holidayManager.getHoliday(date);

    const cell: DayCell = {
      date: DateUtil.clone(date),
      dateString: DateUtil.toISODate(date),
      dayOfMonth: date.getDate(),
      dayOfWeek: date.getDay(),
      isCurrentMonth,
      isToday: DateUtil.isToday(date),
      isWeekend: DateUtil.isWeekend(date),
      isDisabled: this.calendar.isDateDisabled(date),
      isSelected: this.calendar.isDateSelected(date),
      isInRange: this.calendar.isDateInSelectedRange(date),
      events,
      eventCount: events.length,
    };

    // 添加农历信息
    if (state.showLunar) {
      cell.lunarInfo = LunarCalendar.solarToLunar(date);
    }

    // 添加节假日信息
    if (holiday) {
      cell.holiday = holiday;
    }

    return cell;
  }
}

/**
 * 月视图策略
 */
export class MonthViewStrategy extends ViewStrategy {
  generateViewData(date: Date): MonthViewData {
    const state = this.calendar.getState();
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // 获取月份的第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = DateUtil.getEndOfMonth(firstDay);
    
    // 获取日历视图的开始日期（可能是上个月的日期）
    const startDate = DateUtil.getStartOfWeek(firstDay, state.firstDayOfWeek);
    
    // 生成6周的数据（42天）
    const weeks: WeekRow[] = [];
    let currentDate = DateUtil.clone(startDate);
    
    for (let week = 0; week < 6; week++) {
      const days: DayCell[] = [];
      const weekStart = DateUtil.clone(currentDate);
      
      for (let day = 0; day < 7; day++) {
        const isCurrentMonth = currentDate.getMonth() === month;
        days.push(this.createDayCell(currentDate, isCurrentMonth));
        currentDate = DateUtil.addDays(currentDate, 1);
      }
      
      const weekRow: WeekRow = { days };
      
      // 添加周数
      if (state.showWeekNumber) {
        weekRow.weekNumber = DateUtil.getWeekOfYear(weekStart);
      }
      
      weeks.push(weekRow);
    }
    
    return {
      year,
      month,
      weeks,
      totalDays: DateUtil.getDaysInMonth(year, month),
    };
  }
}

/**
 * 周视图策略
 */
export class WeekViewStrategy extends ViewStrategy {
  generateViewData(date: Date): WeekViewData {
    const state = this.calendar.getState();
    const year = date.getFullYear();
    
    // 获取周的开始和结束日期
    const startDate = DateUtil.getStartOfWeek(date, state.firstDayOfWeek);
    const endDate = DateUtil.getEndOfWeek(date, state.firstDayOfWeek);
    
    // 生成7天的数据
    const days: DayCell[] = [];
    let currentDate = DateUtil.clone(startDate);
    
    for (let i = 0; i < 7; i++) {
      days.push(this.createDayCell(currentDate, true));
      currentDate = DateUtil.addDays(currentDate, 1);
    }
    
    return {
      year,
      weekNumber: DateUtil.getWeekOfYear(startDate),
      days,
      startDate: DateUtil.clone(startDate),
      endDate: DateUtil.clone(endDate),
    };
  }
}

/**
 * 日视图策略
 */
export class DayViewStrategy extends ViewStrategy {
  generateViewData(date: Date): DayViewData {
    const dayInfo = this.createDayCell(date, true);
    
    // 生成24小时的时间槽
    const hours: HourSlot[] = [];
    const startOfDay = DateUtil.getStartOfDay(date);
    
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(startOfDay);
      hourStart.setHours(hour);
      
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hour + 1);
      
      // 获取这个小时内的事件
      const hourEvents = this.calendar.eventManager
        .getEventsInRange(hourStart, hourEnd);
      
      hours.push({
        hour,
        hourString: this.formatHour(hour),
        events: hourEvents,
        hasEvents: hourEvents.length > 0,
      });
    }
    
    return {
      date: DateUtil.clone(date),
      dayInfo,
      hours,
    };
  }
  
  /**
   * 格式化小时
   */
  private formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }
}

/**
 * 视图策略工厂
 */
export class ViewStrategyFactory {
  /**
   * 创建视图策略
   */
  static create(viewMode: 'month' | 'week' | 'day', calendar: CalendarCore): ViewStrategy {
    switch (viewMode) {
      case 'month':
        return new MonthViewStrategy(calendar);
      case 'week':
        return new WeekViewStrategy(calendar);
      case 'day':
        return new DayViewStrategy(calendar);
      default:
        throw new Error(`Unknown view mode: ${viewMode}`);
    }
  }
}