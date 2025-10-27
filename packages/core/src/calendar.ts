/**
 * @ldesign/calendar-core - 核心 Calendar 类（优化版）
 */

import type {
  CalendarConfig,
  CalendarEvent,
  CalendarView,
  CalendarInstance,
} from './types';
import { EventManager } from './event-manager';
import { ViewManager } from './view-manager';
import { EventEmitter } from './utils/event-emitter';
import { generateId } from './utils/event';

/**
 * Calendar 类
 */
export class Calendar implements CalendarInstance {
  private config: CalendarConfig;
  private eventManager: EventManager;
  private viewManager: ViewManager;
  private eventEmitter: EventEmitter;
  private isInitialized = false;
  private isDestroyed = false;

  constructor(config: CalendarConfig = {}) {
    this.config = this.mergeConfig(config);
    this.eventEmitter = new EventEmitter();

    // 初始化管理器
    this.eventManager = new EventManager(this.config.storage);
    this.viewManager = new ViewManager(
      this.config.initialView,
      this.config.initialDate,
      this.config.firstDayOfWeek
    );

    // 设置回调
    this.setupCallbacks();

    // 初始化
    this.init();
  }

  /**
   * 初始化
   */
  private async init(): Promise<void> {
    if (this.isDestroyed) return;

    // 从存储加载事件
    await this.eventManager.init();

    // 监听事件变更
    this.eventManager.onChange(() => {
      this.notifyRender();
    });

    this.isInitialized = true;
    this.notifyRender();
  }

  /**
   * 合并配置
   */
  private mergeConfig(config: CalendarConfig): CalendarConfig {
    return {
      initialView: 'month',
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
   * 改变视图
   */
  changeView(view: CalendarView): void {
    this.assertNotDestroyed();
    this.viewManager.setCurrentView(view);
    this.notifyRender();
    this.eventEmitter.emitSync('viewChange', view, this.viewManager.getCurrentDate());
  }

  /**
   * 下一个周期
   */
  next(): void {
    this.assertNotDestroyed();
    this.viewManager.next();
    this.notifyRender();
  }

  /**
   * 上一个周期
   */
  prev(): void {
    this.assertNotDestroyed();
    this.viewManager.prev();
    this.notifyRender();
  }

  /**
   * 跳转到今天
   */
  today(): void {
    this.assertNotDestroyed();
    this.viewManager.today();
    this.notifyRender();
  }

  /**
   * 跳转到指定日期
   */
  gotoDate(date: Date): void {
    this.assertNotDestroyed();
    this.viewManager.setCurrentDate(date);
    this.notifyRender();
  }

  /**
   * 添加事件
   */
  async addEvent(event: Omit<CalendarEvent, 'id'>): Promise<string> {
    this.assertNotDestroyed();

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
    this.assertNotDestroyed();

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
    this.assertNotDestroyed();

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
    this.assertNotDestroyed();
    return this.eventManager.getEvents(start, end);
  }

  /**
   * 获取单个事件
   */
  getEvent(id: string): CalendarEvent | null {
    this.assertNotDestroyed();
    return this.eventManager.findEvent(id);
  }

  /**
   * 获取当前视图
   */
  getCurrentView(): CalendarView {
    return this.viewManager.getCurrentView();
  }

  /**
   * 获取当前日期
   */
  getCurrentDate(): Date {
    return this.viewManager.getCurrentDate();
  }

  /**
   * 获取配置
   */
  getConfig(): CalendarConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CalendarConfig>): void {
    this.assertNotDestroyed();
    this.config = { ...this.config, ...config };
    this.notifyRender();
  }

  /**
   * 渲染通知
   */
  render(): void {
    this.notifyRender();
  }

  /**
   * 监听事件
   */
  on(event: string, callback: Function): () => void {
    return this.eventEmitter.on(event, callback);
  }

  /**
   * 取消监听
   */
  off(event: string, callback: Function): void {
    this.eventEmitter.off(event, callback);
  }

  /**
   * 销毁（清理资源）
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.eventManager.destroy();
    this.eventEmitter.destroy();
    this.isDestroyed = true;
    this.isInitialized = false;
  }

  /**
   * 通知渲染
   */
  private notifyRender(): void {
    if (!this.isInitialized || this.isDestroyed) return;

    const viewConfig = this.viewManager.getViewConfig();
    const events = this.eventManager.getEvents(
      viewConfig.dateRange.start,
      viewConfig.dateRange.end
    );

    this.eventEmitter.emitSync('render', {
      view: viewConfig.type,
      date: viewConfig.currentDate,
      dateRange: viewConfig.dateRange,
      events,
      config: this.config,
    });
  }

  /**
   * 断言未销毁
   */
  private assertNotDestroyed(): void {
    if (this.isDestroyed) {
      throw new Error('Calendar instance has been destroyed');
    }
  }
}

/**
 * 便捷创建函数
 */
export function createCalendar(config: CalendarConfig = {}): Calendar {
  return new Calendar(config);
}

