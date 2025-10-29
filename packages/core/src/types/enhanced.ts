/**
 * @ldesign/calendar-core - 澧炲己绫诲瀷瀹氫箟
 * 鎻愪緵娉涘瀷鏀寔鍜屾洿涓ユ牸鐨勭被鍨嬬害鏉?
 */

import type {
  CalendarEvent as BaseCalendarEvent,
  CalendarView,
} from './index'

/**
 * 澧炲己鐨勬棩鍘嗕簨浠剁被鍨嬶紙鏀寔娉涘瀷鎵╁睍灞炴€э級
 * @template T - 鑷畾涔夋墿灞曞睘鎬х被鍨?
 */
export interface EnhancedCalendarEvent<T extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<BaseCalendarEvent, 'extendedProps'> {
  /** 绫诲瀷瀹夊叏鐨勬墿灞曞睘鎬?*/
  extendedProps?: T
}

/**
 * 澧炲己鐨勬棩鍘嗛厤缃被鍨?
 * @template T - 浜嬩欢鎵╁睍灞炴€х被鍨?
 */
export interface EnhancedCalendarConfig<T extends Record<string, unknown> = Record<string, unknown>> {
  // 瑙嗗浘閰嶇疆
  initialView?: CalendarView
  initialDate?: Date | string

  // 鏃堕棿閰嶇疆
  timezone?: string
  locale?: string
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  weekends?: boolean

  // 浜や簰閰嶇疆
  editable?: boolean
  selectable?: boolean

  // 浜嬩欢閰嶇疆
  events?: EnhancedCalendarEvent<T>[] | string | ((info: EventFetchInfo) => Promise<EnhancedCalendarEvent<T>[]>)

  // 鍥炶皟鍑芥暟
  onEventClick?: (info: EventClickInfo<T>) => void
  onEventChange?: (info: EventChangeInfo<T>) => void
  onDateSelect?: (info: DateSelectInfo) => void
}

/**
 * 浜嬩欢鑾峰彇淇℃伅
 */
export interface EventFetchInfo {
  start: Date
  end: Date
  timezone: string
}

/**
 * 浜嬩欢鐐瑰嚮淇℃伅
 */
export interface EventClickInfo<T extends Record<string, unknown> = Record<string, unknown>> {
  event: EnhancedCalendarEvent<T>
  jsEvent: MouseEvent
  view: CalendarView
}

/**
 * 浜嬩欢鍙樻洿淇℃伅
 */
export interface EventChangeInfo<T extends Record<string, unknown> = Record<string, unknown>> {
  event: EnhancedCalendarEvent<T>
  oldEvent: EnhancedCalendarEvent<T>
  revert: () => void
}

/**
 * 鏃ユ湡閫夋嫨淇℃伅
 */
export interface DateSelectInfo {
  start: Date
  end: Date
  allDay: boolean
  jsEvent: MouseEvent
  view: CalendarView
}

/**
 * Enhanced Storage Adapter Interface
 */
export interface EnhancedStorageAdapter<T extends Record<string, unknown> = Record<string, unknown>> {
  getEvents: () => Promise<EnhancedCalendarEvent<T>[]>
  getEvent: (id: string) => Promise<EnhancedCalendarEvent<T> | null>
  addEvent: (event: EnhancedCalendarEvent<T>) => Promise<EnhancedCalendarEvent<T>>
  updateEvent: (id: string, updates: Partial<EnhancedCalendarEvent<T>>) => Promise<EnhancedCalendarEvent<T>>
  deleteEvent: (id: string) => Promise<void>
  batchAddEvents?: (events: EnhancedCalendarEvent<T>[]) => Promise<EnhancedCalendarEvent<T>[]>
  batchUpdateEvents?: (updates: Array<{ id: string; data: Partial<EnhancedCalendarEvent<T>> }>) => Promise<void>
  batchDeleteEvents?: (ids: string[]) => Promise<void>
}

/**
 * 鎻掍欢鎺ュ彛
 */
export interface CalendarPlugin {
  name: string
  version?: string
  install: (calendar: unknown) => void
  destroy?: () => void
}

// 閲嶆柊瀵煎嚭鍩虹绫诲瀷
export type { CalendarView, RecurrenceRule } from './index'

