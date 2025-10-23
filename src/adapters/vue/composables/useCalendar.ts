/**
 * @ldesign/calendar - Vue Composition API
 */

import { ref, onMounted, onBeforeUnmount, Ref } from 'vue';
import { Calendar } from '../../../core/calendar';
import type { CalendarConfig, CalendarEvent, CalendarView } from '../../../types';

export interface UseCalendarReturn {
  calendarRef: Ref<HTMLElement | undefined>;
  calendar: Ref<Calendar | null>;
  events: Ref<CalendarEvent[]>;
  currentView: Ref<CalendarView>;
  currentDate: Ref<Date>;
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
  const calendarRef = ref<HTMLElement>();
  const calendar = ref<Calendar | null>(null);
  const events = ref<CalendarEvent[]>([]);
  const currentView = ref<CalendarView>(config.initialView || ('month' as CalendarView));
  const currentDate = ref<Date>(config.initialDate || new Date());

  onMounted(() => {
    if (calendarRef.value) {
      calendar.value = new Calendar(calendarRef.value, config);

      // 监听事件变更
      calendar.value.on('eventCreate', updateEvents);
      calendar.value.on('eventUpdate', updateEvents);
      calendar.value.on('eventDelete', updateEvents);
      calendar.value.on('viewChange', (view: CalendarView, date: Date) => {
        currentView.value = view;
        currentDate.value = date;
      });

      // 初始化事件列表
      updateEvents();
    }
  });

  onBeforeUnmount(() => {
    if (calendar.value) {
      calendar.value.destroy();
      calendar.value = null;
    }
  });

  const updateEvents = () => {
    if (calendar.value) {
      events.value = calendar.value.getEvents();
    }
  };

  const addEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<string> => {
    if (!calendar.value) {
      throw new Error('Calendar not initialized');
    }
    const id = await calendar.value.addEvent(event);
    updateEvents();
    return id;
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<void> => {
    if (!calendar.value) {
      throw new Error('Calendar not initialized');
    }
    await calendar.value.updateEvent(id, updates);
    updateEvents();
  };

  const deleteEvent = async (id: string): Promise<void> => {
    if (!calendar.value) {
      throw new Error('Calendar not initialized');
    }
    await calendar.value.deleteEvent(id);
    updateEvents();
  };

  const getEvents = (start?: Date, end?: Date): CalendarEvent[] => {
    if (!calendar.value) {
      return [];
    }
    return calendar.value.getEvents(start, end);
  };

  const changeView = (view: CalendarView): void => {
    calendar.value?.changeView(view);
  };

  const next = (): void => {
    calendar.value?.next();
  };

  const prev = (): void => {
    calendar.value?.prev();
  };

  const today = (): void => {
    calendar.value?.today();
  };

  const gotoDate = (date: Date): void => {
    calendar.value?.gotoDate(date);
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

