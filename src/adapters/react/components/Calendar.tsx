/**
 * @ldesign/calendar - React 组件
 */

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Calendar as CalendarCore } from '../../../core/calendar';
import type { CalendarConfig, CalendarEvent, CalendarView } from '../../../types';

export interface CalendarProps {
  config?: CalendarConfig;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (event: CalendarEvent) => void | boolean | Promise<void | boolean>;
  onEventUpdate?: (event: CalendarEvent, oldEvent: CalendarEvent) => void | boolean | Promise<void | boolean>;
  onEventDelete?: (id: string) => void | boolean | Promise<void | boolean>;
  onDateSelect?: (start: Date, end: Date) => void;
  onDateClick?: (date: Date) => void;
  onViewChange?: (view: CalendarView, date: Date) => void;
  onEventDragStart?: (event: CalendarEvent) => void;
  onEventDragEnd?: (event: CalendarEvent) => void;
  onEventResizeStart?: (event: CalendarEvent) => void;
  onEventResizeEnd?: (event: CalendarEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface CalendarRef {
  getCalendar: () => CalendarCore | null;
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

export const Calendar = forwardRef<CalendarRef, CalendarProps>((props, ref) => {
  const {
    config = {},
    events = [],
    onEventClick,
    onEventCreate,
    onEventUpdate,
    onEventDelete,
    onDateSelect,
    onDateClick,
    onViewChange,
    onEventDragStart,
    onEventDragEnd,
    onEventResizeStart,
    onEventResizeEnd,
    className,
    style,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<CalendarCore | null>(null);

  // 初始化
  useEffect(() => {
    if (!containerRef.current) return;

    // 创建日历实例
    calendarRef.current = new CalendarCore(containerRef.current, config);

    // 绑定事件
    if (onEventClick) {
      calendarRef.current.on('eventClick', onEventClick);
    }
    if (onEventCreate) {
      calendarRef.current.on('eventCreate', onEventCreate);
    }
    if (onEventUpdate) {
      calendarRef.current.on('eventUpdate', onEventUpdate);
    }
    if (onEventDelete) {
      calendarRef.current.on('eventDelete', onEventDelete);
    }
    if (onDateSelect) {
      calendarRef.current.on('dateSelect', onDateSelect);
    }
    if (onDateClick) {
      calendarRef.current.on('dateClick', onDateClick);
    }
    if (onViewChange) {
      calendarRef.current.on('viewChange', onViewChange);
    }
    if (onEventDragStart) {
      calendarRef.current.on('eventDragStart', onEventDragStart);
    }
    if (onEventDragEnd) {
      calendarRef.current.on('eventDragEnd', onEventDragEnd);
    }
    if (onEventResizeStart) {
      calendarRef.current.on('eventResizeStart', onEventResizeStart);
    }
    if (onEventResizeEnd) {
      calendarRef.current.on('eventResizeEnd', onEventResizeEnd);
    }

    // 添加初始事件
    if (events && events.length > 0) {
      events.forEach(event => {
        calendarRef.current?.addEvent(event);
      });
    }

    // 清理
    return () => {
      if (calendarRef.current) {
        calendarRef.current.destroy();
        calendarRef.current = null;
      }
    };
  }, []);

  // 监听事件变化
  useEffect(() => {
    if (calendarRef.current && events) {
      // TODO: 智能更新事件（diff算法）
      calendarRef.current.render();
    }
  }, [events]);

  // 暴露方法
  useImperativeHandle(ref, () => ({
    getCalendar: () => calendarRef.current,
    addEvent: async (event: Omit<CalendarEvent, 'id'>) => {
      if (!calendarRef.current) {
        throw new Error('Calendar not initialized');
      }
      return await calendarRef.current.addEvent(event);
    },
    updateEvent: async (id: string, updates: Partial<CalendarEvent>) => {
      if (!calendarRef.current) {
        throw new Error('Calendar not initialized');
      }
      await calendarRef.current.updateEvent(id, updates);
    },
    deleteEvent: async (id: string) => {
      if (!calendarRef.current) {
        throw new Error('Calendar not initialized');
      }
      await calendarRef.current.deleteEvent(id);
    },
    getEvents: (start?: Date, end?: Date) => {
      if (!calendarRef.current) {
        return [];
      }
      return calendarRef.current.getEvents(start, end);
    },
    changeView: (view: CalendarView) => {
      calendarRef.current?.changeView(view);
    },
    next: () => {
      calendarRef.current?.next();
    },
    prev: () => {
      calendarRef.current?.prev();
    },
    today: () => {
      calendarRef.current?.today();
    },
    gotoDate: (date: Date) => {
      calendarRef.current?.gotoDate(date);
    },
  }));

  return (
    <div
      ref={containerRef}
      className={`ldesign-calendar-wrapper ${className || ''}`}
      style={style}
    />
  );
});

Calendar.displayName = 'Calendar';

