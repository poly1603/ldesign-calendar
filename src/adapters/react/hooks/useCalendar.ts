/**
 * @ldesign/calendar - React Hook
 */

import { useState, useEffect, useRef } from 'react';
import { Calendar } from '../../../core/calendar';
import type { CalendarConfig, CalendarEvent, CalendarView } from '../../../types';

export interface UseCalendarReturn {
  calendarRef: React.RefObject<HTMLDivElement>;
  calendar: Calendar | null;
  events: CalendarEvent[];
  currentView: CalendarView;
  currentDate: Date;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<string>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEvents: (start?: Date, end?: Date) => CalendarEvent[];
  changeView: (view: CalendarView) => void;
  next: () => void;
  prev: () => void;
  today: () => void;
  gotoDate: (date: Date) => void;
}

/**
 * useCalendar Hook
 */
export function useCalendar(config: CalendarConfig = {}): UseCalendarReturn {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentView, setCurrentView] = useState<CalendarView>(
    config.initialView || ('month' as CalendarView)
  );
  const [currentDate, setCurrentDate] = useState<Date>(config.initialDate || new Date());

  useEffect(() => {
    if (!calendarRef.current) return;

    // 创建日历实例
    const instance = new Calendar(calendarRef.current, config);
    setCalendar(instance);

    // 监听事件变更
    const updateEvents = () => {
      setEvents(instance.getEvents());
    };

    instance.on('eventCreate', updateEvents);
    instance.on('eventUpdate', updateEvents);
    instance.on('eventDelete', updateEvents);
    instance.on('viewChange', (view: CalendarView, date: Date) => {
      setCurrentView(view);
      setCurrentDate(date);
    });

    // 初始化事件列表
    updateEvents();

    // 清理
    return () => {
      instance.destroy();
    };
  }, []);

  const addEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<string> => {
    if (!calendar) {
      throw new Error('Calendar not initialized');
    }
    const id = await calendar.addEvent(event);
    setEvents(calendar.getEvents());
    return id;
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<void> => {
    if (!calendar) {
      throw new Error('Calendar not initialized');
    }
    await calendar.updateEvent(id, updates);
    setEvents(calendar.getEvents());
  };

  const deleteEvent = async (id: string): Promise<void> => {
    if (!calendar) {
      throw new Error('Calendar not initialized');
    }
    await calendar.deleteEvent(id);
    setEvents(calendar.getEvents());
  };

  const getEvents = (start?: Date, end?: Date): CalendarEvent[] => {
    if (!calendar) {
      return [];
    }
    return calendar.getEvents(start, end);
  };

  const changeView = (view: CalendarView): void => {
    calendar?.changeView(view);
  };

  const next = (): void => {
    calendar?.next();
  };

  const prev = (): void => {
    calendar?.prev();
  };

  const today = (): void => {
    calendar?.today();
  };

  const gotoDate = (date: Date): void => {
    calendar?.gotoDate(date);
  };

  return {
    calendarRef,
    calendar,
    events,
    currentView,
    currentDate,
    addEvent,
    updateEvent,
    deleteEvent,
    getEvents,
    changeView,
    next,
    prev,
    today,
    gotoDate,
  };
}

