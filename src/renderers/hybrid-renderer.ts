/**
 * @ldesign/calendar - 混合渲染器
 * 结合 DOM 和 Canvas 渲染，提供最佳性能和可访问性
 */

import type { CalendarConfig, CalendarEvent, CalendarView, EventLayout, RenderOptions } from '../types';
import { DOMRenderer } from './dom-renderer';
import { CanvasRenderer } from './canvas-renderer';

/**
 * 混合渲染器
 */
export class HybridRenderer {
  private domRenderer: DOMRenderer;
  private canvasRenderer?: CanvasRenderer;
  private useCanvas: boolean;

  constructor(container: HTMLElement, config: CalendarConfig, renderOptions?: RenderOptions) {
    this.domRenderer = new DOMRenderer(container, config);
    this.useCanvas = renderOptions?.useCanvas !== false;

    if (this.useCanvas) {
      // Canvas 渲染器将在需要时创建
    }
  }

  /**
   * 渲染日历框架
   */
  render(): void {
    this.domRenderer.render();
  }

  /**
   * 渲染月视图
   */
  renderMonthView(dates: Date[], currentMonth: Date, events: CalendarEvent[]): void {
    const bodyElement = this.domRenderer.getBodyElement();
    if (!bodyElement) return;

    // 清空主体
    bodyElement.innerHTML = '';

    // 渲染日期网格
    const grid = this.domRenderer.renderDateGrid(dates, currentMonth);
    bodyElement.appendChild(grid);

    // 渲染事件（使用 DOM 或 Canvas）
    if (this.useCanvas && events.length > 50) {
      // 大量事件时使用 Canvas
      this.renderEventsWithCanvas(bodyElement, events);
    } else {
      // 少量事件时使用 DOM
      this.renderEventsWithDOM(dates, events);
    }
  }

  /**
   * 渲染周视图
   */
  renderWeekView(dates: Date[], events: CalendarEvent[]): void {
    const bodyElement = this.domRenderer.getBodyElement();
    if (!bodyElement) return;

    // 清空主体
    bodyElement.innerHTML = '';

    // 渲染周视图容器
    const weekView = this.domRenderer.renderWeekView(dates);
    bodyElement.appendChild(weekView);

    // 渲染事件
    this.renderWeekEvents(weekView, events);
  }

  /**
   * 渲染日视图
   */
  renderDayView(date: Date, events: CalendarEvent[]): void {
    const bodyElement = this.domRenderer.getBodyElement();
    if (!bodyElement) return;

    // 清空主体
    bodyElement.innerHTML = '';

    // 渲染日视图（类似周视图但只有一列）
    const dayView = this.domRenderer.renderWeekView([date]);
    bodyElement.appendChild(dayView);

    // 渲染事件
    this.renderWeekEvents(dayView, events);
  }

  /**
   * 渲染议程视图
   */
  renderAgendaView(events: CalendarEvent[]): void {
    const bodyElement = this.domRenderer.getBodyElement();
    if (!bodyElement) return;

    // 清空主体
    bodyElement.innerHTML = '';

    // 创建列表容器
    const list = document.createElement('div');
    list.className = 'ldesign-calendar-agenda-list';

    if (events.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'ldesign-calendar-agenda-empty';
      empty.textContent = '暂无事件';
      list.appendChild(empty);
    } else {
      events.forEach(event => {
        const item = this.renderAgendaItem(event);
        list.appendChild(item);
      });
    }

    bodyElement.appendChild(list);
  }

  /**
   * 更新标题
   */
  updateTitle(date: Date, view: CalendarView): void {
    this.domRenderer.updateTitle(date, view);
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CalendarConfig>): void {
    this.domRenderer.updateConfig(config);
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.domRenderer.destroy();
    this.canvasRenderer?.destroy();
  }

  /**
   * 使用 DOM 渲染事件
   */
  private renderEventsWithDOM(dates: Date[], events: CalendarEvent[]): void {
    const eventsByDate = this.groupEventsByDate(events, dates);

    dates.forEach((date, index) => {
      const dateKey = date.toDateString();
      const dateEvents = eventsByDate.get(dateKey) || [];

      if (dateEvents.length > 0) {
        const cell = document.querySelector(`[data-date="${date.toISOString()}"]`);
        const container = cell?.querySelector('.ldesign-calendar-events-container');

        if (container) {
          dateEvents.slice(0, 3).forEach(event => {
            const eventEl = this.createEventElement(event);
            container.appendChild(eventEl);
          });

          if (dateEvents.length > 3) {
            const more = document.createElement('div');
            more.className = 'ldesign-calendar-more-events';
            more.textContent = `+${dateEvents.length - 3} 更多`;
            container.appendChild(more);
          }
        }
      }
    });
  }

  /**
   * 使用 Canvas 渲染事件
   */
  private renderEventsWithCanvas(container: HTMLElement, events: CalendarEvent[]): void {
    if (!this.canvasRenderer) {
      this.canvasRenderer = new CanvasRenderer(container);
    }

    // TODO: 实现 Canvas 事件渲染布局算法
    // 这里需要计算每个事件的精确位置
  }

  /**
   * 渲染周视图事件
   */
  private renderWeekEvents(container: HTMLElement, events: CalendarEvent[]): void {
    const columns = container.querySelectorAll('.ldesign-calendar-week-column');

    columns.forEach((column, index) => {
      const dateStr = column.getAttribute('data-date');
      if (!dateStr) return;

      const date = new Date(dateStr);
      const dayEvents = events.filter(event => this.isEventOnDate(event, date));

      if (dayEvents.length > 0) {
        // 计算事件布局
        const layouts = this.calculateEventLayouts(dayEvents);

        layouts.forEach(layout => {
          const eventEl = this.createTimeEventElement(layout);
          column.appendChild(eventEl);
        });
      }
    });
  }

  /**
   * 渲染议程项
   */
  private renderAgendaItem(event: CalendarEvent): HTMLElement {
    const item = document.createElement('div');
    item.className = 'ldesign-calendar-agenda-item';
    item.setAttribute('data-event-id', event.id);

    const color = event.backgroundColor || event.color || '#3788d8';

    item.innerHTML = `
      <div class="ldesign-calendar-agenda-time">
        ${this.formatTime(event.start)} - ${this.formatTime(event.end)}
      </div>
      <div class="ldesign-calendar-agenda-content">
        <div class="ldesign-calendar-agenda-indicator" style="background-color: ${color}"></div>
        <div class="ldesign-calendar-agenda-title">${event.title}</div>
      </div>
    `;

    return item;
  }

  /**
   * 创建事件元素
   */
  private createEventElement(event: CalendarEvent): HTMLElement {
    const el = document.createElement('div');
    el.className = 'ldesign-calendar-event';
    el.setAttribute('data-event-id', event.id);
    el.textContent = event.title;

    const colors = {
      backgroundColor: event.backgroundColor || event.color || '#3788d8',
      borderColor: event.borderColor || event.color || '#3788d8',
      textColor: event.textColor || '#ffffff',
    };

    el.style.backgroundColor = colors.backgroundColor;
    el.style.borderColor = colors.borderColor;
    el.style.color = colors.textColor;

    return el;
  }

  /**
   * 创建时间事件元素（周/日视图）
   */
  private createTimeEventElement(layout: EventLayout): HTMLElement {
    const el = this.createEventElement(layout.event);
    el.classList.add('ldesign-calendar-time-event');

    el.style.position = 'absolute';
    el.style.left = `${layout.left}%`;
    el.style.width = `${layout.width}%`;
    el.style.top = `${layout.top}px`;
    el.style.height = `${layout.height}px`;

    return el;
  }

  /**
   * 按日期分组事件
   */
  private groupEventsByDate(events: CalendarEvent[], dates: Date[]): Map<string, CalendarEvent[]> {
    const grouped = new Map<string, CalendarEvent[]>();

    dates.forEach(date => {
      const dateKey = date.toDateString();
      grouped.set(dateKey, []);
    });

    events.forEach(event => {
      dates.forEach(date => {
        if (this.isEventOnDate(event, date)) {
          const dateKey = date.toDateString();
          grouped.get(dateKey)!.push(event);
        }
      });
    });

    return grouped;
  }

  /**
   * 判断事件是否在指定日期
   */
  private isEventOnDate(event: CalendarEvent, date: Date): boolean {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return event.start < dayEnd && event.end > dayStart;
  }

  /**
   * 计算事件布局
   */
  private calculateEventLayouts(events: CalendarEvent[]): EventLayout[] {
    // 简化版布局算法
    const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
    const containerHeight = 24 * 60; // 24小时 * 60像素/小时

    return sorted.map((event, index) => {
      const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
      const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
      const duration = endMinutes - startMinutes;

      return {
        event,
        left: 0,
        width: 100,
        top: startMinutes,
        height: duration,
      };
    });
  }

  /**
   * 格式化时间
   */
  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

