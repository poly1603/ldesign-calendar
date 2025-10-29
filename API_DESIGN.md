# @ldesign/calendar API设计规范

## 📋 总体原则

### 一致性原则
- 所有框架适配器提供统一的API接口
- 相同的配置项、方法名、事件名
- 统一的类型定义和错误处理

### 渐进式增强
- 简单场景下开箱即用
- 复杂场景下可灵活配置
- 支持插件和扩展机制

### 类型安全
- 完整的TypeScript类型定义
- 泛型支持自定义事件属性
- 严格的类型检查，无any类型

---

## 🎯 Core包API

### CalendarCore类

```typescript
import type { 
  CalendarConfig, 
  CalendarEvent, 
  CalendarView,
  DateRange,
  EventFilter
} from '@ldesign/calendar-core'

class CalendarCore<T extends Record<string, any> = Record<string, any>> {
  constructor(config?: CalendarConfig<T>)
  
  // 视图管理
  changeView(view: CalendarView): void
  getView(): CalendarView
  next(): void
  prev(): void
  today(): void
  gotoDate(date: Date | string): void
  getVisibleRange(): DateRange
  
  // 事件管理
  addEvent(event: CalendarEvent<T>): Promise<CalendarEvent<T>>
  updateEvent(eventId: string, updates: Partial<CalendarEvent<T>>): Promise<CalendarEvent<T>>
  deleteEvent(eventId: string): Promise<void>
  getEvent(eventId: string): CalendarEvent<T> | null
  getEvents(filter?: EventFilter): CalendarEvent<T>[]
  getEventsInRange(start: Date, end: Date): CalendarEvent<T>[]
  
  // 批量操作
  batchAddEvents(events: CalendarEvent<T>[]): Promise<CalendarEvent<T>[]>
  batchUpdateEvents(updates: Array<{ id: string; data: Partial<CalendarEvent<T>> }>): Promise<void>
  batchDeleteEvents(eventIds: string[]): Promise<void>
  
  // 重复事件
  expandRecurrence(eventId: string, range: DateRange): CalendarEvent<T>[]
  updateRecurringEvent(eventId: string, updates: Partial<CalendarEvent<T>>, mode: 'this' | 'following' | 'all'): Promise<void>
  
  // 搜索和过滤
  searchEvents(query: string): CalendarEvent<T>[]
  filterEvents(predicate: (event: CalendarEvent<T>) => boolean): CalendarEvent<T>[]
  
  // 导入导出
  import(data: string | File, format: 'ical' | 'csv' | 'json'): Promise<CalendarEvent<T>[]>
  export(format: 'ical' | 'csv' | 'json', events?: CalendarEvent<T>[]): Promise<string | Blob>
  
  // 撤销/重做
  undo(): void
  redo(): void
  canUndo(): boolean
  canRedo(): boolean
  clearHistory(): void
  
  // 事件监听
  on<K extends keyof CalendarEvents<T>>(event: K, handler: CalendarEvents<T>[K]): () => void
  off<K extends keyof CalendarEvents<T>>(event: K, handler: CalendarEvents<T>[K]): void
  once<K extends keyof CalendarEvents<T>>(event: K, handler: CalendarEvents<T>[K]): () => void
  
  // 生命周期
  render(): void
  refresh(): void
  destroy(): void
  
  // 配置管理
  getConfig(): CalendarConfig<T>
  updateConfig(updates: Partial<CalendarConfig<T>>): void
}
```

### 类型定义

```typescript
// 日历配置
interface CalendarConfig<T extends Record<string, any> = Record<string, any>> {
  // 视图配置
  initialView?: CalendarView
  initialDate?: Date | string
  views?: {
    month?: MonthViewConfig
    week?: WeekViewConfig
    day?: DayViewConfig
    agenda?: AgendaViewConfig
  }
  
  // 时间配置
  timezone?: string
  locale?: string
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  weekends?: boolean
  businessHours?: BusinessHours
  slotDuration?: string // '00:15:00'
  minTime?: string // '00:00:00'
  maxTime?: string // '24:00:00'
  
  // 交互配置
  editable?: boolean
  selectable?: boolean
  selectMirror?: boolean
  selectOverlap?: boolean | ((event: CalendarEvent<T>) => boolean)
  eventDurationEditable?: boolean
  eventStartEditable?: boolean
  eventResizableFromStart?: boolean
  
  // 显示配置
  height?: number | string | 'auto' | 'parent'
  contentHeight?: number | string | 'auto'
  aspectRatio?: number
  headerToolbar?: ToolbarConfig | false
  footerToolbar?: ToolbarConfig | false
  nowIndicator?: boolean
  scrollTime?: string
  
  // 事件配置
  events?: CalendarEvent<T>[] | string | ((info: EventFetchInfo) => Promise<CalendarEvent<T>[]>)
  eventOrder?: string | string[] | ((a: CalendarEvent<T>, b: CalendarEvent<T>) => number)
  eventLimit?: boolean | number
  eventLimitText?: string | ((num: number) => string)
  
  // 样式配置
  theme?: 'standard' | 'bootstrap' | 'material' | string
  themeSystem?: 'standard' | 'bootstrap' | 'material'
  
  // 插件配置
  plugins?: CalendarPlugin[]
  
  // 存储配置
  storage?: StorageAdapter<T>
  
  // 性能配置
  lazyFetching?: boolean
  progressiveEventRendering?: boolean
  eventRenderWait?: number
  rerenderDelay?: number
  
  // 回调函数
  onEventClick?: (info: EventClickInfo<T>) => void
  onEventMouseEnter?: (info: EventHoverInfo<T>) => void
  onEventMouseLeave?: (info: EventHoverInfo<T>) => void
  onEventDragStart?: (info: EventDragInfo<T>) => void
  onEventDragStop?: (info: EventDragInfo<T>) => void
  onEventDrop?: (info: EventDropInfo<T>) => void | false
  onEventResize?: (info: EventResizeInfo<T>) => void | false
  onSelect?: (info: DateSelectInfo) => void
  onUnselect?: (info: DateUnselectInfo) => void
  onDateClick?: (info: DateClickInfo) => void
  onViewDidMount?: (info: ViewMountInfo) => void
  onViewWillUnmount?: (info: ViewMountInfo) => void
  onDatesSet?: (info: DatesSetInfo) => void
  onEventsSet?: (events: CalendarEvent<T>[]) => void
}

// 日历事件
interface CalendarEvent<T extends Record<string, any> = Record<string, any>> {
  id: string
  title: string
  start: Date | string
  end?: Date | string
  allDay?: boolean
  
  // 重复规则
  recurrence?: RecurrenceRule
  recurrenceId?: string // 重复事件的父ID
  recurrenceException?: Date[] // 例外日期
  
  // 显示样式
  color?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  classNames?: string[]
  
  // 交互配置
  editable?: boolean
  startEditable?: boolean
  durationEditable?: boolean
  resourceEditable?: boolean
  overlap?: boolean
  constraint?: string | BusinessHours
  
  // 扩展属性
  description?: string
  location?: string
  url?: string
  extendedProps?: T
  
  // 渲染配置
  display?: 'auto' | 'block' | 'list-item' | 'background' | 'inverse-background' | 'none'
  
  // 源信息
  source?: string
}

// 重复规则
interface RecurrenceRule {
  freq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval?: number // 间隔
  count?: number // 重复次数
  until?: Date | string // 结束日期
  byweekday?: number[] // 星期几 (0-6, 0=周日)
  bymonthday?: number[] // 月份中的第几天
  bymonth?: number[] // 月份 (1-12)
  byyearday?: number[] // 年份中的第几天
  byweekno?: number[] // 年份中的第几周
  byhour?: number[] // 小时
  byminute?: number[] // 分钟
  bysecond?: number[] // 秒
  bysetpos?: number[] // 位置
  wkst?: number // 一周开始日 (0-6)
}

// 视图类型
type CalendarView = 'month' | 'week' | 'day' | 'agenda' | 'list' | string

// 日期范围
interface DateRange {
  start: Date
  end: Date
}

// 事件过滤器
interface EventFilter {
  start?: Date
  end?: Date
  title?: string
  search?: string
  [key: string]: any
}

// 工作时间
interface BusinessHours {
  daysOfWeek?: number[] // 工作日 (0-6)
  startTime?: string // '09:00'
  endTime?: string // '17:00'
}

// 工具栏配置
interface ToolbarConfig {
  start?: string // 'prev,next today'
  center?: string // 'title'
  end?: string // 'month,week,day'
}

// 事件系统
interface CalendarEvents<T extends Record<string, any> = Record<string, any>> {
  eventAdd: (event: CalendarEvent<T>) => void
  eventChange: (event: CalendarEvent<T>) => void
  eventRemove: (eventId: string) => void
  eventsSet: (events: CalendarEvent<T>[]) => void
  viewChange: (view: CalendarView) => void
  dateChange: (date: Date) => void
  select: (info: DateSelectInfo) => void
  unselect: () => void
  loading: (isLoading: boolean) => void
  error: (error: Error) => void
}
```

---

## 🎨 Vue适配器API

### 组件API

```vue
<template>
  <Calendar
    :config="calendarConfig"
    :events="events"
    @event-click="handleEventClick"
    @date-select="handleDateSelect"
  />
</template>

<script setup lang="ts">
import { Calendar } from '@ldesign/calendar-vue'
import type { CalendarConfig, CalendarEvent } from '@ldesign/calendar-core'

const calendarConfig: CalendarConfig = {
  initialView: 'month',
  selectable: true
}

const events: CalendarEvent[] = [
  { id: '1', title: 'Event 1', start: new Date() }
]

function handleEventClick(info: EventClickInfo) {
  console.log('Event clicked:', info.event)
}

function handleDateSelect(info: DateSelectInfo) {
  console.log('Date selected:', info.start, info.end)
}
</script>
```

### Composables API

```typescript
import { useCalendar, useEvents } from '@ldesign/calendar-vue'
import type { CalendarEvent } from '@ldesign/calendar-core'

// useCalendar
const { calendar, view, currentDate } = useCalendar({
  initialView: 'month',
  selectable: true
})

// 视图操作
calendar.next()
calendar.prev()
calendar.today()
calendar.changeView('week')

// 响应式状态
console.log(view.value) // 'month'
console.log(currentDate.value) // Date对象

// useEvents
const { 
  events, 
  addEvent, 
  updateEvent, 
  deleteEvent,
  getEvent,
  searchEvents 
} = useEvents(calendar)

// 事件操作
await addEvent({
  id: '1',
  title: 'New Event',
  start: new Date()
})

await updateEvent('1', { title: 'Updated Event' })
await deleteEvent('1')

// 响应式事件列表
console.log(events.value) // CalendarEvent[]

// useViews
import { useViews } from '@ldesign/calendar-vue'

const { 
  currentView, 
  changeView, 
  visibleRange 
} = useViews(calendar)

// useRecurrence
import { useRecurrence } from '@ldesign/calendar-vue'

const {
  expandRecurrence,
  updateRecurringEvent
} = useRecurrence(calendar)
```

---

## ⚛️ React适配器API

### 组件API

```tsx
import { Calendar } from '@ldesign/calendar-react'
import type { CalendarConfig, CalendarEvent, EventClickInfo, DateSelectInfo } from '@ldesign/calendar-core'

function App() {
  const calendarConfig: CalendarConfig = {
    initialView: 'month',
    selectable: true
  }
  
  const events: CalendarEvent[] = [
    { id: '1', title: 'Event 1', start: new Date() }
  ]
  
  const handleEventClick = (info: EventClickInfo) => {
    console.log('Event clicked:', info.event)
  }
  
  const handleDateSelect = (info: DateSelectInfo) => {
    console.log('Date selected:', info.start, info.end)
  }
  
  return (
    <Calendar
      config={calendarConfig}
      events={events}
      onEventClick={handleEventClick}
      onDateSelect={handleDateSelect}
    />
  )
}
```

### Hooks API

```typescript
import { useCalendar, useEvents } from '@ldesign/calendar-react'
import type { CalendarEvent } from '@ldesign/calendar-core'

// useCalendar
const { calendarRef, view, currentDate, changeView, next, prev, today } = useCalendar({
  initialView: 'month',
  selectable: true
})

// 视图操作
next()
prev()
today()
changeView('week')

// 状态
console.log(view) // 'month'
console.log(currentDate) // Date对象

// useEvents
const { 
  events, 
  addEvent, 
  updateEvent, 
  deleteEvent,
  getEvent,
  searchEvents,
  loading,
  error
} = useEvents(calendarRef)

// 事件操作
await addEvent({
  id: '1',
  title: 'New Event',
  start: new Date()
})

// useRecurrence
import { useRecurrence } from '@ldesign/calendar-react'

const {
  expandRecurrence,
  updateRecurringEvent
} = useRecurrence(calendarRef)
```

---

## 🔥 Svelte适配器API

### 组件API

```svelte
<script lang="ts">
  import { Calendar } from '@ldesign/calendar-svelte'
  import type { CalendarConfig, CalendarEvent } from '@ldesign/calendar-core'
  
  const config: CalendarConfig = {
    initialView: 'month',
    selectable: true
  }
  
  const events: CalendarEvent[] = [
    { id: '1', title: 'Event 1', start: new Date() }
  ]
  
  function handleEventClick(event: CustomEvent) {
    console.log('Event clicked:', event.detail.event)
  }
</script>

<Calendar
  {config}
  {events}
  on:event-click={handleEventClick}
/>
```

### Stores API

```typescript
import { calendarStore, eventsStore } from '@ldesign/calendar-svelte'

// Calendar store
const { view, currentDate, changeView, next, prev, today } = calendarStore({
  initialView: 'month'
})

// 订阅状态
view.subscribe(v => console.log('View changed:', v))

// Events store
const { events, addEvent, updateEvent, deleteEvent } = eventsStore()

// 事件操作
await addEvent({
  id: '1',
  title: 'New Event',
  start: new Date()
})

// 订阅事件列表
events.subscribe(e => console.log('Events updated:', e))
```

---

## 💎 Solid.js适配器API

### 组件API

```tsx
import { Calendar } from '@ldesign/calendar-solid'
import type { CalendarConfig, CalendarEvent } from '@ldesign/calendar-core'

function App() {
  const config: CalendarConfig = {
    initialView: 'month',
    selectable: true
  }
  
  const events: CalendarEvent[] = [
    { id: '1', title: 'Event 1', start: new Date() }
  ]
  
  const handleEventClick = (info: EventClickInfo) => {
    console.log('Event clicked:', info.event)
  }
  
  return (
    <Calendar
      config={config}
      events={events}
      onEventClick={handleEventClick}
    />
  )
}
```

### Primitives API

```typescript
import { createCalendar, createEvents } from '@ldesign/calendar-solid'

// createCalendar
const [state, actions] = createCalendar({
  initialView: 'month',
  selectable: true
})

// Signals
console.log(state.view()) // 'month'
console.log(state.currentDate()) // Date对象

// Actions
actions.next()
actions.prev()
actions.changeView('week')

// createEvents
const [events, eventActions] = createEvents()

// 事件操作
await eventActions.add({
  id: '1',
  title: 'New Event',
  start: new Date()
})

// Signals
console.log(events()) // CalendarEvent[]
```

---

## 🅰️ Angular适配器API

### 组件API

```typescript
import { Component } from '@angular/core'
import { CalendarComponent } from '@ldesign/calendar-angular'
import type { CalendarConfig, CalendarEvent, EventClickInfo } from '@ldesign/calendar-core'

@Component({
  selector: 'app-root',
  template: `
    <ldesign-calendar
      [config]="calendarConfig"
      [events]="events"
      (eventClick)="handleEventClick($event)"
      (dateSelect)="handleDateSelect($event)"
    />
  `,
  standalone: true,
  imports: [CalendarComponent]
})
export class AppComponent {
  calendarConfig: CalendarConfig = {
    initialView: 'month',
    selectable: true
  }
  
  events: CalendarEvent[] = [
    { id: '1', title: 'Event 1', start: new Date() }
  ]
  
  handleEventClick(info: EventClickInfo) {
    console.log('Event clicked:', info.event)
  }
  
  handleDateSelect(info: DateSelectInfo) {
    console.log('Date selected:', info.start, info.end)
  }
}
```

### Service API

```typescript
import { Injectable } from '@angular/core'
import { CalendarService } from '@ldesign/calendar-angular'
import type { CalendarEvent } from '@ldesign/calendar-core'

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private calendarService: CalendarService) {}
  
  async addEvent(event: CalendarEvent) {
    return await this.calendarService.addEvent(event)
  }
  
  getEvents() {
    return this.calendarService.events$
  }
}
```

---

## ⚡ Qwik适配器API

```tsx
import { component$, useSignal } from '@builder.io/qwik'
import { Calendar } from '@ldesign/calendar-qwik'
import type { CalendarConfig, CalendarEvent } from '@ldesign/calendar-core'

export default component$(() => {
  const events = useSignal<CalendarEvent[]>([
    { id: '1', title: 'Event 1', start: new Date() }
  ])
  
  const config: CalendarConfig = {
    initialView: 'month',
    selectable: true
  }
  
  return (
    <Calendar
      config={config}
      events={events.value}
      onEventClick$={(info) => {
        console.log('Event clicked:', info.event)
      }}
    />
  )
})
```

---

## 🌐 Web Components API

```html
<ldesign-calendar id="calendar"></ldesign-calendar>

<script>
  const calendar = document.getElementById('calendar')
  
  // 配置
  calendar.config = {
    initialView: 'month',
    selectable: true
  }
  
  // 事件
  calendar.events = [
    { id: '1', title: 'Event 1', start: new Date() }
  ]
  
  // 监听事件
  calendar.addEventListener('event-click', (e) => {
    console.log('Event clicked:', e.detail.event)
  })
  
  // 方法调用
  calendar.next()
  calendar.prev()
  calendar.changeView('week')
</script>
```

---

## 🔌 插件系统API

```typescript
interface CalendarPlugin {
  name: string
  version?: string
  install(calendar: CalendarCore): void
  destroy?(): void
}

// 插件示例
const myPlugin: CalendarPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  install(calendar) {
    // 添加自定义功能
    calendar.on('eventClick', (info) => {
      console.log('Plugin: Event clicked', info)
    })
  },
  destroy() {
    // 清理资源
  }
}

// 使用插件
const calendar = new CalendarCore({
  plugins: [myPlugin]
})
```

---

## 📊 性能优化API

```typescript
// 批量操作
await calendar.batchAddEvents(events)
await calendar.batchUpdateEvents(updates)
await calendar.batchDeleteEvents(eventIds)

// 懒加载
const calendar = new CalendarCore({
  lazyFetching: true,
  events: async (info) => {
    const response = await fetch(`/api/events?start=${info.start}&end=${info.end}`)
    return await response.json()
  }
})

// 渐进式渲染
const calendar = new CalendarCore({
  progressiveEventRendering: true,
  eventRenderWait: 50
})

// 虚拟滚动（大数据量）
const calendar = new CalendarCore({
  views: {
    month: {
      virtualScroll: true
    }
  }
})
```

---

## 🎯 统一的错误处理

```typescript
// 自定义错误类型
class CalendarError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'CalendarError'
  }
}

// 错误监听
calendar.on('error', (error: CalendarError) => {
  console.error(`[${error.code}] ${error.message}`, error.details)
})

// 错误类型
enum ErrorCode {
  INVALID_CONFIG = 'INVALID_CONFIG',
  INVALID_EVENT = 'INVALID_EVENT',
  STORAGE_ERROR = 'STORAGE_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}
```

---

**最后更新**：2025-01-28
**文档版本**：v1.0
