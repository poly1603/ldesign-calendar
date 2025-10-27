/**
 * @ldesign/calendar-vue - useCalendar Composable
 */

import { ref, onMounted, onUnmounted, shallowRef } from 'vue';
import type { Ref } from 'vue';
import type {
  Calendar,
  CalendarConfig,
  CalendarEvent,
  CalendarView,
} from '@ldesign/calendar-core';
import { createCalendar } from '@ldesign/calendar-core';

export interface UseCalendarReturn {
  /** 日历实例 */
  calendar: Ref<Calendar | null>;
  /** 事件列表 */
  events: Ref<CalendarEvent[]>;
  /** 当前视图 */
  currentView: Ref<CalendarView>;
  /** 当前日期 */
  currentDate: Ref<Date>;
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
 * useCalendar Composable
 */
export function useCalendar(config: CalendarConfig = {}): UseCalendarReturn {
  const calendar = shallowRef<Calendar | null>(null);
  const events = ref<CalendarEvent[]>([]);
  const currentView = ref<CalendarView>(config.initialView || 'month');
  const currentDate = ref<Date>(config.initialDate || new Date());

  /**
   * 更新状态
   */
  const updateState = () => {
    if (!calendar.value) return;

    events.value = calendar.value.getEvents();
    currentView.value = calendar.value.getCurrentView();
    currentDate.value = calendar.value.getCurrentDate();
  };

  /**
   * 初始化
   */
  onMounted(() => {
    calendar.value = createCalendar(config);

    // 监听渲染事件
    calendar.value.on('render', () => {
      updateState();
    });

    updateState();
  });

  /**
   * 清理
   */
  onUnmounted(() => {
    calendar.value?.destroy();
  });

  /**
   * 切换视图
   */
  const changeView = (view: CalendarView) => {
    calendar.value?.changeView(view);
  };

  /**
   * 下一个周期
   */
  const next = () => {
    calendar.value?.next();
  };

  /**
   * 上一个周期
   */
  const prev = () => {
    calendar.value?.prev();
  };

  /**
   * 跳转到今天
   */
  const today = () => {
    calendar.value?.today();
  };

  /**
   * 跳转到指定日期
   */
  const gotoDate = (date: Date) => {
    calendar.value?.gotoDate(date);
  };

  /**
   * 添加事件
   */
  const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    if (!calendar.value) throw new Error('Calendar not initialized');
    const id = await calendar.value.addEvent(event);
    updateState();
    return id;
  };

  /**
   * 更新事件
   */
  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    if (!calendar.value) throw new Error('Calendar not initialized');
    await calendar.value.updateEvent(id, updates);
    updateState();
  };

  /**
   * 删除事件
   */
  const deleteEvent = async (id: string) => {
    if (!calendar.value) throw new Error('Calendar not initialized');
    await calendar.value.deleteEvent(id);
    updateState();
  };

  /**
   * 获取事件
   */
  const getEvents = (start?: Date, end?: Date) => {
    return calendar.value?.getEvents(start, end) || [];
  };

  /**
   * 获取单个事件
   */
  const getEvent = (id: string) => {
    return calendar.value?.getEvent(id) || null;
  };

  /**
   * 刷新
   */
  const refresh = () => {
    calendar.value?.render();
    updateState();
  };

  return {
    calendar,
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

