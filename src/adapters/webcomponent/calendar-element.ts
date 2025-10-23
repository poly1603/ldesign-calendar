/**
 * @ldesign/calendar - Web Component
 */

import { Calendar } from '../../core/calendar';
import type { CalendarConfig, CalendarEvent, CalendarView } from '../../types';

/**
 * Calendar Web Component
 */
export class CalendarElement extends HTMLElement {
  private calendar: Calendar | null = null;
  private config: CalendarConfig = {};

  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return ['view', 'date', 'editable', 'selectable'];
  }

  connectedCallback(): void {
    // 解析配置
    this.parseConfig();

    // 创建日历实例
    this.calendar = new Calendar(this, this.config);

    // 绑定事件
    this.bindEvents();
  }

  disconnectedCallback(): void {
    if (this.calendar) {
      this.calendar.destroy();
      this.calendar = null;
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (!this.calendar || oldValue === newValue) return;

    switch (name) {
      case 'view':
        this.calendar.changeView(newValue as CalendarView);
        break;
      case 'date':
        this.calendar.gotoDate(new Date(newValue));
        break;
      case 'editable':
        // 重新初始化配置
        this.config.editable = newValue === 'true';
        break;
      case 'selectable':
        this.config.selectable = newValue === 'true';
        break;
    }
  }

  /**
   * 解析配置
   */
  private parseConfig(): void {
    const configAttr = this.getAttribute('config');

    if (configAttr) {
      try {
        this.config = JSON.parse(configAttr);
      } catch (error) {
        console.error('Failed to parse config attribute:', error);
      }
    }

    // 从属性覆盖配置
    const view = this.getAttribute('view');
    if (view) {
      this.config.initialView = view as CalendarView;
    }

    const date = this.getAttribute('date');
    if (date) {
      this.config.initialDate = new Date(date);
    }

    const editable = this.getAttribute('editable');
    if (editable !== null) {
      this.config.editable = editable === 'true';
    }

    const selectable = this.getAttribute('selectable');
    if (selectable !== null) {
      this.config.selectable = selectable === 'true';
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.calendar) return;

    // 转发事件到自定义事件
    this.calendar.on('eventClick', (event: CalendarEvent) => {
      this.dispatchEvent(new CustomEvent('event-click', { detail: event }));
    });

    this.calendar.on('eventCreate', (event: CalendarEvent) => {
      this.dispatchEvent(new CustomEvent('event-create', { detail: event }));
    });

    this.calendar.on('eventUpdate', (event: CalendarEvent, oldEvent: CalendarEvent) => {
      this.dispatchEvent(
        new CustomEvent('event-update', { detail: { event, oldEvent } })
      );
    });

    this.calendar.on('eventDelete', (id: string) => {
      this.dispatchEvent(new CustomEvent('event-delete', { detail: { id } }));
    });

    this.calendar.on('dateSelect', (start: Date, end: Date) => {
      this.dispatchEvent(new CustomEvent('date-select', { detail: { start, end } }));
    });

    this.calendar.on('dateClick', (date: Date) => {
      this.dispatchEvent(new CustomEvent('date-click', { detail: date }));
    });

    this.calendar.on('viewChange', (view: CalendarView, date: Date) => {
      this.dispatchEvent(new CustomEvent('view-change', { detail: { view, date } }));
    });
  }

  /**
   * 公共方法
   */
  addEvent(event: Omit<CalendarEvent, 'id'>): Promise<string> {
    if (!this.calendar) {
      throw new Error('Calendar not initialized');
    }
    return this.calendar.addEvent(event);
  }

  updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<void> {
    if (!this.calendar) {
      throw new Error('Calendar not initialized');
    }
    return this.calendar.updateEvent(id, updates);
  }

  deleteEvent(id: string): Promise<void> {
    if (!this.calendar) {
      throw new Error('Calendar not initialized');
    }
    return this.calendar.deleteEvent(id);
  }

  getEvents(start?: Date, end?: Date): CalendarEvent[] {
    if (!this.calendar) {
      return [];
    }
    return this.calendar.getEvents(start, end);
  }

  changeView(view: CalendarView): void {
    this.calendar?.changeView(view);
  }

  next(): void {
    this.calendar?.next();
  }

  prev(): void {
    this.calendar?.prev();
  }

  today(): void {
    this.calendar?.today();
  }

  gotoDate(date: Date): void {
    this.calendar?.gotoDate(date);
  }
}

// 注册自定义元素
if (!customElements.get('ldesign-calendar')) {
  customElements.define('ldesign-calendar', CalendarElement);
}

