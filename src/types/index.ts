/**
 * @ldesign/calendar - TypeScript 类型定义
 */

/**
 * 视图类型
 */
export enum CalendarView {
  Month = 'month',
  Week = 'week',
  Day = 'day',
  Agenda = 'agenda',
}

/**
 * 重复频率
 */
export enum RecurrenceFrequency {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Yearly = 'yearly',
}

/**
 * 星期枚举
 */
export enum Weekday {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

/**
 * 重复规则
 */
export interface RecurrenceRule {
  /** 重复频率 */
  freq: RecurrenceFrequency;
  /** 间隔（每 N 天/周/月/年） */
  interval?: number;
  /** 结束日期 */
  until?: Date;
  /** 重复次数 */
  count?: number;
  /** 每周的哪几天（仅 weekly） */
  byweekday?: Weekday[];
  /** 每月的第几天（仅 monthly） */
  bymonthday?: number[];
  /** 每年的第几个月（仅 yearly） */
  bymonth?: number[];
}

/**
 * 日历事件
 */
export interface CalendarEvent {
  /** 唯一标识 */
  id: string;
  /** 标题 */
  title: string;
  /** 开始时间 */
  start: Date;
  /** 结束时间 */
  end: Date;
  /** 是否全天事件 */
  allDay?: boolean;
  /** 颜色 */
  color?: string;
  /** 背景色 */
  backgroundColor?: string;
  /** 边框颜色 */
  borderColor?: string;
  /** 文本颜色 */
  textColor?: string;
  /** 描述 */
  description?: string;
  /** 地点 */
  location?: string;
  /** 重复规则 */
  recurrence?: RecurrenceRule;
  /** 原始事件 ID（重复事件实例） */
  originalEventId?: string;
  /** 是否可编辑 */
  editable?: boolean;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 是否可调整大小 */
  resizable?: boolean;
  /** 自定义数据 */
  extendedProps?: Record<string, any>;
}

/**
 * 事件布局信息
 */
export interface EventLayout {
  event: CalendarEvent;
  /** 左边距百分比 */
  left: number;
  /** 宽度百分比 */
  width: number;
  /** 顶部位置（像素） */
  top?: number;
  /** 高度（像素） */
  height?: number;
  /** 列索引 */
  columnIndex?: number;
  /** 总列数 */
  totalColumns?: number;
}

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  /** 是否显示标题 */
  title?: boolean;
  /** 是否显示今天按钮 */
  today?: boolean;
  /** 是否显示前后导航按钮 */
  navigation?: boolean;
  /** 是否显示视图切换按钮 */
  viewSwitcher?: boolean;
  /** 自定义按钮 */
  customButtons?: ToolbarButton[];
}

/**
 * 工具栏按钮
 */
export interface ToolbarButton {
  text: string;
  icon?: string;
  click: () => void;
}

/**
 * 日历配置
 */
export interface CalendarConfig {
  /** 初始视图 */
  initialView?: CalendarView;
  /** 初始日期 */
  initialDate?: Date;
  /** 工具栏配置 */
  toolbar?: ToolbarConfig;
  /** 一周的第一天（0=周日，1=周一） */
  firstDayOfWeek?: Weekday;
  /** 工作时间开始 */
  businessHoursStart?: number;
  /** 工作时间结束 */
  businessHoursEnd?: number;
  /** 时区 */
  timeZone?: string;
  /** 是否显示周末 */
  weekends?: boolean;
  /** 时间格式 */
  timeFormat?: string;
  /** 日期格式 */
  dateFormat?: string;
  /** 事件默认时长（分钟） */
  defaultEventDuration?: number;
  /** 时间间隔（分钟） */
  slotDuration?: number;
  /** 最小时间间隔（分钟） */
  slotMinTime?: number;
  /** 最大时间间隔（分钟） */
  slotMaxTime?: number;
  /** 是否启用拖拽 */
  editable?: boolean;
  /** 是否允许选择 */
  selectable?: boolean;
  /** 高度 */
  height?: number | 'auto';
  /** 宽度 */
  width?: number | 'auto';
  /** 主题 */
  theme?: string;
  /** 本地化 */
  locale?: string;
  /** 存储适配器 */
  storage?: StorageAdapter;
  /** 事件回调 */
  callbacks?: CalendarCallbacks;
  /** 自定义渲染 */
  customRenders?: CustomRenders;
}

/**
 * 事件回调
 */
export interface CalendarCallbacks {
  /** 事件点击 */
  onEventClick?: (event: CalendarEvent) => void;
  /** 事件创建 */
  onEventCreate?: (event: CalendarEvent) => void | boolean | Promise<void | boolean>;
  /** 事件更新 */
  onEventUpdate?: (event: CalendarEvent, oldEvent: CalendarEvent) => void | boolean | Promise<void | boolean>;
  /** 事件删除 */
  onEventDelete?: (eventId: string) => void | boolean | Promise<void | boolean>;
  /** 日期选择 */
  onDateSelect?: (start: Date, end: Date) => void;
  /** 日期点击 */
  onDateClick?: (date: Date) => void;
  /** 视图改变 */
  onViewChange?: (view: CalendarView, date: Date) => void;
  /** 事件拖拽开始 */
  onEventDragStart?: (event: CalendarEvent) => void;
  /** 事件拖拽结束 */
  onEventDragEnd?: (event: CalendarEvent) => void;
  /** 事件调整大小开始 */
  onEventResizeStart?: (event: CalendarEvent) => void;
  /** 事件调整大小结束 */
  onEventResizeEnd?: (event: CalendarEvent) => void;
}

/**
 * 自定义渲染函数
 */
export interface CustomRenders {
  /** 自定义事件渲染 */
  renderEvent?: (event: CalendarEvent, element: HTMLElement) => void;
  /** 自定义日期单元格渲染 */
  renderDateCell?: (date: Date, element: HTMLElement) => void;
  /** 自定义时间单元格渲染 */
  renderTimeCell?: (time: Date, element: HTMLElement) => void;
}

/**
 * 存储适配器接口
 */
export interface StorageAdapter {
  /** 保存事件 */
  save(events: CalendarEvent[]): Promise<void>;
  /** 加载事件 */
  load(): Promise<CalendarEvent[]>;
  /** 清除所有事件 */
  clear(): Promise<void>;
  /** 创建单个事件 */
  create?(event: CalendarEvent): Promise<void>;
  /** 更新单个事件 */
  update?(id: string, updates: Partial<CalendarEvent>): Promise<void>;
  /** 删除单个事件 */
  delete?(id: string): Promise<void>;
}

/**
 * 日期范围
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * 视图配置
 */
export interface ViewConfig {
  type: CalendarView;
  currentDate: Date;
  dateRange: DateRange;
}

/**
 * 拖拽信息
 */
export interface DragInfo {
  event: CalendarEvent;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  originalStart: Date;
  originalEnd: Date;
}

/**
 * 调整大小信息
 */
export interface ResizeInfo {
  event: CalendarEvent;
  edge: 'start' | 'end';
  startY: number;
  currentY: number;
  originalStart: Date;
  originalEnd: Date;
}

/**
 * 选择信息
 */
export interface SelectInfo {
  start: Date;
  end: Date;
  allDay: boolean;
}

/**
 * 渲染选项
 */
export interface RenderOptions {
  /** 是否使用 Canvas 渲染 */
  useCanvas?: boolean;
  /** 是否启用虚拟滚动 */
  virtualScrolling?: boolean;
  /** Canvas DPI 倍数 */
  dpiScale?: number;
  /** 是否显示网格线 */
  showGrid?: boolean;
  /** 是否显示时间线 */
  showTimeline?: boolean;
}

/**
 * Calendar 实例接口
 */
export interface CalendarInstance {
  /** 改变视图 */
  changeView(view: CalendarView): void;
  /** 下一个周期 */
  next(): void;
  /** 上一个周期 */
  prev(): void;
  /** 跳转到今天 */
  today(): void;
  /** 跳转到指定日期 */
  gotoDate(date: Date): void;
  /** 添加事件 */
  addEvent(event: Omit<CalendarEvent, 'id'>): Promise<string>;
  /** 更新事件 */
  updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<void>;
  /** 删除事件 */
  deleteEvent(id: string): Promise<void>;
  /** 获取事件 */
  getEvents(start?: Date, end?: Date): CalendarEvent[];
  /** 获取单个事件 */
  getEvent(id: string): CalendarEvent | null;
  /** 渲染 */
  render(): void;
  /** 销毁 */
  destroy(): void;
  /** 监听事件 */
  on(event: string, callback: Function): void;
  /** 取消监听 */
  off(event: string, callback: Function): void;
}

/**
 * 事件管理器接口
 */
export interface EventManagerInterface {
  createEvent(event: CalendarEvent): Promise<void>;
  updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<void>;
  deleteEvent(id: string): Promise<void>;
  getEvents(start?: Date, end?: Date): CalendarEvent[];
  findEvent(id: string): CalendarEvent | null;
  getAllEvents(): CalendarEvent[];
  clear(): Promise<void>;
}

