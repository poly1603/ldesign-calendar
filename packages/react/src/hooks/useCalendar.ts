/**
 * @ldesign/calendar-react - useCalendar Hook
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  Calendar,
  CalendarConfig,
  CalendarEvent,
  CalendarView,
} from '@ldesign/calendar-core';
import { createCalendar } from '@ldesign/calendar-core';

export interface UseCalendarReturn {
  /** 日历实例 */
  calendar: Calendar | null;
  /** 事件列表 */
  events: CalendarEvent[];
  /** 当前视图 */
  currentView: CalendarView;
  /** 当前日期 */
  currentDate: Date;
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
  /** 刷新 */
  refresh: () => void;
}

/**
 * useCalendar Hook
 */
export function useCalendar(config: CalendarConfig = {}): UseCalendarReturn {
  const calendarRef = useRef<Calendar | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentView, setCurrentView] = useState<CalendarView>(config.initialView || 'month');
  const [currentDate, setCurrentDate] = useState<Date>(config.initialDate || new Date());

  /**
   * 更新状态
   */
  const updateState = useCallback(() => {
    if (!calendarRef.current) return;

    setEvents(calendarRef.current.getEvents());
    setCurrentView(calendarRef.current.getCurrentView());
    setCurrentDate(calendarRef.current.getCurrentDate());
  }, []);

  /**
   * 初始化
   */
  useEffect(() => {
    calendarRef.current = createCalendar(config);

    // 监听渲染事件
    const unsubscribe = calendarRef.current.on('render', () => {
      updateState();
    });

    updateState();

    // 清理
    return () => {
      unsubscribe();
      calendarRef.current?.destroy();
      calendarRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * 切换视图
   */
  const changeView = useCallback((view: CalendarView) => {
    calendarRef.current?.changeView(view);
  }, []);

  /**
   * 下一个周期
   */
  const next = useCallback(() => {
    calendarRef.current?.next();
  }, []);

  /**
   * 上一个周期
   */
  const prev = useCallback(() => {
    calendarRef.current?.prev();
  }, []);

  /**
   * 跳转到今天
   */
  const today = useCallback(() => {
    calendarRef.current?.today();
  }, []);

  /**
   * 跳转到指定日期
   */
  const gotoDate = useCallback((date: Date) => {
    calendarRef.current?.gotoDate(date);
  }, []);

  /**
   * 添加事件
   */
  const addEvent = useCallback(async (event: Omit<CalendarEvent, 'id'>) => {
    if (!calendarRef.current) throw new Error('Calendar not initialized');
    const id = await calendarRef.current.addEvent(event);
    updateState();
    return id;
  }, [updateState]);

  /**
   * 更新事件
   */
  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    if (!calendarRef.current) throw new Error('Calendar not initialized');
    await calendarRef.current.updateEvent(id, updates);
    updateState();
  }, [updateState]);

  /**
   * 删除事件
   */
  const deleteEvent = useCallback(async (id: string) => {
    if (!calendarRef.current) throw new Error('Calendar not initialized');
    await calendarRef.current.deleteEvent(id);
    updateState();
  }, [updateState]);

  /**
   * 获取事件
   */
  const getEvents = useCallback((start?: Date, end?: Date) => {
    return calendarRef.current?.getEvents(start, end) || [];
  }, []);

  /**
   * 获取单个事件
   */
  const getEvent = useCallback((id: string) => {
    return calendarRef.current?.getEvent(id) || null;
  }, []);

  /**
   * 刷新
   */
  const refresh = useCallback(() => {
    calendarRef.current?.render();
    updateState();
  }, [updateState]);

  return {
    calendar: calendarRef.current,
    events,
    currentView,
    currentDate,
    changeView,
    next,
    prev,
    today,
    gotoDate,
    addEvent,
    updateEvent,
    deleteEvent,
    getEvents,
    getEvent,
    refresh,
  };
}

