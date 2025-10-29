/**
 * @ldesign/calendar-core - 鏍稿績 Calendar 绫伙紙浼樺寲鐗堬級
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
 * Calendar 绫? */
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

    // 鍒濆鍖栫鐞嗗櫒
    this.eventManager = new EventManager(this.config.storage);
    this.viewManager = new ViewManager(
      this.config.initialView,
      this.config.initialDate,
      this.config.firstDayOfWeek
    );

    // 璁剧疆鍥炶皟
    this.setupCallbacks();

    // 鍒濆鍖?    this.initialize().catch(console.error);
  }

  /**
   * Initialize
   */
  // @ts-expect-error - Method is used via this.initialize() call
  private async initialize(): Promise<void> {
    if (this.isDestroyed) return;

    // Load events from storage
    await this.eventManager.init();

    // Listen to event changes
    this.eventManager.onChange(() => {
      this.notifyRender();
    });

    this.isInitialized = true;
    this.notifyRender();
  }

  /**
   * 鍚堝苟閰嶇疆
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
   * 璁剧疆鍥炶皟
   */
  private setupCallbacks(): void {
    const callbacks = this.config.callbacks || {};

    // 娉ㄥ唽浜嬩欢鐩戝惉
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
   * 鏀瑰彉瑙嗗浘
   */
  changeView(view: CalendarView): void {
    this.assertNotDestroyed();
    this.viewManager.setCurrentView(view);
    this.notifyRender();
    this.eventEmitter.emitSync('viewChange', view, this.viewManager.getCurrentDate());
  }

  /**
   * 涓嬩竴涓懆鏈?   */
  next(): void {
    this.assertNotDestroyed();
    this.viewManager.next();
    this.notifyRender();
  }

  /**
   * 涓婁竴涓懆鏈?   */
  prev(): void {
    this.assertNotDestroyed();
    this.viewManager.prev();
    this.notifyRender();
  }

  /**
   * 璺宠浆鍒颁粖澶?   */
  today(): void {
    this.assertNotDestroyed();
    this.viewManager.today();
    this.notifyRender();
  }

  /**
   * 璺宠浆鍒版寚瀹氭棩鏈?   */
  gotoDate(date: Date): void {
    this.assertNotDestroyed();
    this.viewManager.setCurrentDate(date);
    this.notifyRender();
  }

  /**
   * 娣诲姞浜嬩欢
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

    // 瑙﹀彂鍥炶皟
    const result = await this.eventEmitter.emit('eventCreate', newEvent);
    if (result === false) {
      throw new Error('Event creation cancelled');
    }

    await this.eventManager.createEvent(newEvent);
    return id;
  }

  /**
   * 鏇存柊浜嬩欢
   */
  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<void> {
    this.assertNotDestroyed();

    const oldEvent = this.eventManager.findEvent(id);
    if (!oldEvent) {
      throw new Error(`Event not found: ${id}`);
    }

    const newEvent = { ...oldEvent, ...updates };

    // 瑙﹀彂鍥炶皟
    const result = await this.eventEmitter.emit('eventUpdate', newEvent, oldEvent);
    if (result === false) {
      throw new Error('Event update cancelled');
    }

    await this.eventManager.updateEvent(id, updates);
  }

  /**
   * 鍒犻櫎浜嬩欢
   */
  async deleteEvent(id: string): Promise<void> {
    this.assertNotDestroyed();

    // 瑙﹀彂鍥炶皟
    const result = await this.eventEmitter.emit('eventDelete', id);
    if (result === false) {
      throw new Error('Event deletion cancelled');
    }

    await this.eventManager.deleteEvent(id);
  }

  /**
   * 鑾峰彇浜嬩欢
   */
  getEvents(start?: Date, end?: Date): CalendarEvent[] {
    this.assertNotDestroyed();
    return this.eventManager.getEvents(start, end);
  }

  /**
   * 鑾峰彇鍗曚釜浜嬩欢
   */
  getEvent(id: string): CalendarEvent | null {
    this.assertNotDestroyed();
    return this.eventManager.findEvent(id);
  }

  /**
   * 鑾峰彇褰撳墠瑙嗗浘
   */
  getCurrentView(): CalendarView {
    return this.viewManager.getCurrentView();
  }

  /**
   * 鑾峰彇褰撳墠鏃ユ湡
   */
  getCurrentDate(): Date {
    return this.viewManager.getCurrentDate();
  }

  /**
   * 鑾峰彇閰嶇疆
   */
  getConfig(): CalendarConfig {
    return { ...this.config };
  }

  /**
   * 鏇存柊閰嶇疆
   */
  updateConfig(config: Partial<CalendarConfig>): void {
    this.assertNotDestroyed();
    this.config = { ...this.config, ...config };
    this.notifyRender();
  }

  /**
   * 娓叉煋閫氱煡
   */
  render(): void {
    this.notifyRender();
  }

  /**
   * Listen to events
   */
  on(event: string, callback: (...args: any[]) => void): () => void {
    return this.eventEmitter.on(event, callback);
  }

  /**
   * 鍙栨秷鐩戝惉
   */
  off(event: string, callback: (...args: any[]) => void): void {
    this.eventEmitter.off(event, callback);
  }

  /**
   * 閿€姣侊紙娓呯悊璧勬簮锛?   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.eventManager.destroy();
    this.eventEmitter.destroy();
    this.isDestroyed = true;
    this.isInitialized = false;
  }

  /**
   * 閫氱煡娓叉煋
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
   * 鏂█鏈攢姣?   */
  private assertNotDestroyed(): void {
    if (this.isDestroyed) {
      throw new Error('Calendar instance has been destroyed');
    }
  }
}

/**
 * 渚挎嵎鍒涘缓鍑芥暟
 */
export function createCalendar(config: CalendarConfig = {}): Calendar {
  return new Calendar(config);
}


