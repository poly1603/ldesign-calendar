/**
 * @ldesign/calendar-react - Calendar 组件
 */

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type {
  Calendar as CalendarCore,
  CalendarConfig,
  CalendarEvent,
  CalendarView,
} from '@ldesign/calendar-core';
import { createCalendar } from '@ldesign/calendar-core';

export interface CalendarProps {
  /** 日历配置 */
  config?: CalendarConfig;
  /** 事件点击回调 */
  onEventClick?: (event: CalendarEvent) => void;
  /** 事件创建回调 */
  onEventCreate?: (event: CalendarEvent) => void | boolean | Promise<void | boolean>;
  /** 事件更新回调 */
  onEventUpdate?: (
    event: CalendarEvent,
    oldEvent: CalendarEvent
  ) => void | boolean | Promise<void | boolean>;
  /** 事件删除回调 */
  onEventDelete?: (eventId: string) => void | boolean | Promise<void | boolean>;
  /** 日期选择回调 */
  onDateSelect?: (start: Date, end: Date) => void;
  /** 日期点击回调 */
  onDateClick?: (date: Date) => void;
  /** 视图变化回调 */
  onViewChange?: (view: CalendarView, date: Date) => void;
  /** 渲染回调 */
  onRender?: (data: any) => void;
}

export interface CalendarRef {
  /** 获取日历实例 */
  getInstance: () => CalendarCore | null;
  /** 切换视图 */
  changeView: (view: CalendarView) => void;
  /** 下一个周期 */
  next: () => void;
  /** 上一个周期 */
  prev: () => void;
  /** 跳转到今天 */
  today: () => void;
  /** 跳转到指定日期 */
  gotoDate: (date: Date) => void;
  /** 添加事件 */
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<string>;
  /** 更新事件 */
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  /** 删除事件 */
  deleteEvent: (id: string) => Promise<void>;
  /** 获取事件 */
  getEvents: (start?: Date, end?: Date) => CalendarEvent[];
  /** 获取单个事件 */
  getEvent: (id: string) => CalendarEvent | null;
  /** 获取当前视图 */
  getCurrentView: () => CalendarView;
  /** 获取当前日期 */
  getCurrentDate: () => Date;
  /** 刷新 */
  refresh: () => void;
}

/**
 * Calendar 组件
 */
export const Calendar = forwardRef<CalendarRef, CalendarProps>((props, ref) => {
  const {
    config = {},
    onEventClick,
    onEventCreate,
    onEventUpdate,
    onEventDelete,
    onDateSelect,
    onDateClick,
    onViewChange,
    onRender,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<CalendarCore | null>(null);

  /**
   * 初始化日历
   */
  useEffect(() => {
    if (!containerRef.current) return;

    // 合并配置和事件回调
    const mergedConfig: CalendarConfig = {
      ...config,
      callbacks: {
        ...config.callbacks,
        onEventClick: (event) => {
          onEventClick?.(event);
          config.callbacks?.onEventClick?.(event);
        },
        onEventCreate: (event) => {
          onEventCreate?.(event);
          return config.callbacks?.onEventCreate?.(event);
        },
        onEventUpdate: (event, oldEvent) => {
          onEventUpdate?.(event, oldEvent);
          return config.callbacks?.onEventUpdate?.(event, oldEvent);
        },
        onEventDelete: (eventId) => {
          onEventDelete?.(eventId);
          return config.callbacks?.onEventDelete?.(eventId);
        },
        onDateSelect: (start, end) => {
          onDateSelect?.(start, end);
          config.callbacks?.onDateSelect?.(start, end);
        },
        onDateClick: (date) => {
          onDateClick?.(date);
          config.callbacks?.onDateClick?.(date);
        },
        onViewChange: (view, date) => {
          onViewChange?.(view, date);
          config.callbacks?.onViewChange?.(view, date);
        },
      },
    };

    // 创建日历实例
    calendarRef.current = createCalendar(mergedConfig);

    // 监听渲染事件
    calendarRef.current.on('render', (data) => {
      onRender?.(data);
    });

    // 清理
    return () => {
      calendarRef.current?.destroy();
      calendarRef.current = null;
    };
  }, []); // 只在挂载时初始化一次

  /**
   * 更新配置
   */
  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.updateConfig(config);
    }
  }, [config]);

  /**
   * 暴露方法
   */
  useImperativeHandle(ref, () => ({
    getInstance: () => calendarRef.current,
    changeView: (view) => calendarRef.current?.changeView(view),
    next: () => calendarRef.current?.next(),
    prev: () => calendarRef.current?.prev(),
    today: () => calendarRef.current?.today(),
    gotoDate: (date) => calendarRef.current?.gotoDate(date),
    addEvent: (event) => {
      if (!calendarRef.current) {
        return Promise.reject(new Error('Calendar not initialized'));
      }
      return calendarRef.current.addEvent(event);
    },
    updateEvent: (id, updates) => {
      if (!calendarRef.current) {
        return Promise.reject(new Error('Calendar not initialized'));
      }
      return calendarRef.current.updateEvent(id, updates);
    },
    deleteEvent: (id) => {
      if (!calendarRef.current) {
        return Promise.reject(new Error('Calendar not initialized'));
      }
      return calendarRef.current.deleteEvent(id);
    },
    getEvents: (start?, end?) => {
      return calendarRef.current?.getEvents(start, end) || [];
    },
    getEvent: (id) => {
      return calendarRef.current?.getEvent(id) || null;
    },
    getCurrentView: () => {
      return calendarRef.current?.getCurrentView() || 'month';
    },
    getCurrentDate: () => {
      return calendarRef.current?.getCurrentDate() || new Date();
    },
    refresh: () => {
      calendarRef.current?.render();
    },
  }));

  return <div ref={containerRef} className="ldesign-calendar-react" style={{ width: '100%', height: '100%' }} />;
});

Calendar.displayName = 'Calendar';

