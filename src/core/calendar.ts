/**
 * @ldesign/calendar - 核心 Calendar 类
 */

import type {
  CalendarConfig,
  CalendarEvent,
  CalendarView,
  CalendarInstance,
  CalendarCallbacks,
} from '../types';
import { EventManager } from './event-manager';
import { ViewManager } from './view-manager';
import { HybridRenderer } from '../renderers/hybrid-renderer';
import { DragHandler } from '../interaction/drag-handler';
import { ResizeHandler } from '../interaction/resize-handler';
import { CreateHandler } from '../interaction/create-handler';
import { getMonthViewDates, getWeekViewDates } from '../utils/date-utils';
import { generateId } from '../utils/event-utils';

/**
 * 事件发射器
 */
class EventEmitter {
  private listeners: Map<string, Set<Function>> = new Map();

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }
}

/**
 * Calendar 类
 */
export class Calendar implements CalendarInstance {
  private container: HTMLElement;
  private config: CalendarConfig;
  private eventManager: EventManager;
  private viewManager: ViewManager;
  private renderer: HybridRenderer;
  private dragHandler: DragHandler;
  private resizeHandler: ResizeHandler;
  private createHandler: CreateHandler;
  private eventEmitter: EventEmitter;
  private isInitialized = false;

  constructor(container: HTMLElement, config: CalendarConfig = {}) {
    this.container = container;
    this.config = this.mergeConfig(config);
    this.eventEmitter = new EventEmitter();

    // 初始化管理器
    this.eventManager = new EventManager(this.config.storage);
    this.viewManager = new ViewManager(
      this.config.initialView,
      this.config.initialDate,
      this.config.firstDayOfWeek
    );

    // 初始化渲染器
    this.renderer = new HybridRenderer(this.container, this.config);

    // 初始化交互处理器
    this.dragHandler = new DragHandler(this.container);
    this.resizeHandler = new ResizeHandler(this.container);
    this.createHandler = new CreateHandler(this.container);

    // 设置回调
    this.setupCallbacks();
    this.setupInteractionHandlers();

    // 初始化
    this.init();
  }

  /**
   * 初始化
   */
  private async init(): Promise<void> {
    // 从存储加载事件
    await this.eventManager.init();

    // 监听事件变更
    this.eventManager.onChange(() => {
      this.render();
    });

    // 渲染
    this.render();

    // 绑定事件
    this.bindEvents();

    this.isInitialized = true;
  }

  /**
   * 合并配置
   */
  private mergeConfig(config: CalendarConfig): CalendarConfig {
    return {
      initialView: 'month' as CalendarView,
      initialDate: new Date(),
      toolbar: {
        title: true,
        today: true,
        navigation: true,
        viewSwitcher: true,
      },
      firstDayOfWeek: 0,
      businessHoursStart: 0,
      businessHoursEnd: 24,
      weekends: true,
      timeFormat: 'HH:mm',
      dateFormat: 'YYYY-MM-DD',
      defaultEventDuration: 60,
      slotDuration: 30,
      editable: true,
      selectable: true,
      height: 'auto',
      theme: 'default',
      locale: 'zh',
      ...config,
    };
  }

  /**
   * 设置回调
   */
  private setupCallbacks(): void {
    const callbacks = this.config.callbacks || {};

    // 注册事件监听
    if (callbacks.onEventClick) {
      this.on('eventClick', callbacks.onEventClick);
    }
    if (callbacks.onEventCreate) {
      this.on('eventCreate', callbacks.onEventCreate);
    }
    if (callbacks.onEventUpdate) {
      this.on('eventUpdate', callbacks.onEventUpdate);
    }
    if (callbacks.onEventDelete) {
      this.on('eventDelete', callbacks.onEventDelete);
    }
    if (callbacks.onDateSelect) {
      this.on('dateSelect', callbacks.onDateSelect);
    }
    if (callbacks.onDateClick) {
      this.on('dateClick', callbacks.onDateClick);
    }
    if (callbacks.onViewChange) {
      this.on('viewChange', callbacks.onViewChange);
    }
  }

  /**
   * 设置交互处理器回调
   */
  private setupInteractionHandlers(): void {
    // 拖拽结束
    this.dragHandler.setOnDragEnd(async (event, newStart, newEnd) => {
      await this.updateEvent(event.id, { start: newStart, end: newEnd });
      this.eventEmitter.emit('eventDragEnd', event);
    });

    // 调整大小结束
    this.resizeHandler.setOnResizeEnd(async (event, newStart, newEnd) => {
      await this.updateEvent(event.id, { start: newStart, end: newEnd });
      this.eventEmitter.emit('eventResizeEnd', event);
    });

    // 选择结束（拖拽创建）
    this.createHandler.setOnSelectEnd((start, end, allDay) => {
      this.eventEmitter.emit('dateSelect', start, end);
    });
  }

  /**
   * 绑定DOM事件
   */
  private bindEvents(): void {
    // 工具栏按钮点击
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const action = target.getAttribute('data-action');

      switch (action) {
        case 'today':
          this.today();
          break;
        case 'prev':
          this.prev();
          break;
        case 'next':
          this.next();
          break;
        case 'view':
          const view = target.getAttribute('data-view') as CalendarView;
          if (view) {
            this.changeView(view);
          }
          break;
      }

      // 事件点击
      if (target.classList.contains('ldesign-calendar-event')) {
        const eventId = target.getAttribute('data-event-id');
        if (eventId) {
          const event = this.eventManager.findEvent(eventId);
          if (event) {
            this.eventEmitter.emit('eventClick', event);
          }
        }
      }

      // 日期点击
      if (target.classList.contains('ldesign-calendar-date-cell')) {
        const dateStr = target.getAttribute('data-date');
        if (dateStr) {
          const date = new Date(dateStr);
          this.eventEmitter.emit('dateClick', date);
        }
      }
    });

    // 事件拖拽
    if (this.config.editable) {
      this.container.addEventListener('mousedown', (e) => {
        const target = e.target as HTMLElement;

        if (target.classList.contains('ldesign-calendar-event')) {
          const eventId = target.getAttribute('data-event-id');
          if (eventId) {
            const event = this.eventManager.findEvent(eventId);
            if (event) {
              this.dragHandler.startDrag(event, e);
              this.eventEmitter.emit('eventDragStart', event);
            }
          }
        }
      });
    }
  }

  /**
   * 渲染
   */
  render(): void {
    const view = this.viewManager.getCurrentView();
    const date = this.viewManager.getCurrentDate();
    const dateRange = this.viewManager.getDateRange();

    // 渲染框架
    this.renderer.render();

    // 更新标题
    this.renderer.updateTitle(date, view);

    // 获取事件
    const events = this.eventManager.getEvents(dateRange.start, dateRange.end);

    // 根据视图类型渲染
    switch (view) {
      case 'month':
        const monthDates = getMonthViewDates(date, this.config.firstDayOfWeek);
        this.renderer.renderMonthView(monthDates, date, events);
        break;

      case 'week':
        const weekDates = getWeekViewDates(date, this.config.firstDayOfWeek);
        this.renderer.renderWeekView(weekDates, events);
        break;

      case 'day':
        this.renderer.renderDayView(date, events);
        break;

      case 'agenda':
        this.renderer.renderAgendaView(events);
        break;
    }
  }

  /**
   * 改变视图
   */
  changeView(view: CalendarView): void {
    this.viewManager.setCurrentView(view);
    this.render();
    this.eventEmitter.emit('viewChange', view, this.viewManager.getCurrentDate());
  }

  /**
   * 下一个周期
   */
  next(): void {
    this.viewManager.next();
    this.render();
  }

  /**
   * 上一个周期
   */
  prev(): void {
    this.viewManager.prev();
    this.render();
  }

  /**
   * 跳转到今天
   */
  today(): void {
    this.viewManager.today();
    this.render();
  }

  /**
   * 跳转到指定日期
   */
  gotoDate(date: Date): void {
    this.viewManager.setCurrentDate(date);
    this.render();
  }

  /**
   * 添加事件
   */
  async addEvent(event: Omit<CalendarEvent, 'id'>): Promise<string> {
    const id = generateId();
    const newEvent: CalendarEvent = {
      ...event,
      id,
      start: new Date(event.start),
      end: new Date(event.end),
    };

    // 触发回调
    const result = await this.eventEmitter.emit('eventCreate', newEvent);
    if (result === false) {
      throw new Error('Event creation cancelled');
    }

    await this.eventManager.createEvent(newEvent);
    return id;
  }

  /**
   * 更新事件
   */
  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<void> {
    const oldEvent = this.eventManager.findEvent(id);
    if (!oldEvent) {
      throw new Error(`Event not found: ${id}`);
    }

    const newEvent = { ...oldEvent, ...updates };

    // 触发回调
    const result = await this.eventEmitter.emit('eventUpdate', newEvent, oldEvent);
    if (result === false) {
      throw new Error('Event update cancelled');
    }

    await this.eventManager.updateEvent(id, updates);
  }

  /**
   * 删除事件
   */
  async deleteEvent(id: string): Promise<void> {
    // 触发回调
    const result = await this.eventEmitter.emit('eventDelete', id);
    if (result === false) {
      throw new Error('Event deletion cancelled');
    }

    await this.eventManager.deleteEvent(id);
  }

  /**
   * 获取事件
   */
  getEvents(start?: Date, end?: Date): CalendarEvent[] {
    return this.eventManager.getEvents(start, end);
  }

  /**
   * 获取单个事件
   */
  getEvent(id: string): CalendarEvent | null {
    return this.eventManager.findEvent(id);
  }

  /**
   * 监听事件
   */
  on(event: string, callback: Function): void {
    this.eventEmitter.on(event, callback);
  }

  /**
   * 取消监听
   */
  off(event: string, callback: Function): void {
    this.eventEmitter.off(event, callback);
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.renderer.destroy();
    this.dragHandler.destroy();
    this.resizeHandler.destroy();
    this.createHandler.destroy();
    this.isInitialized = false;
  }
}

