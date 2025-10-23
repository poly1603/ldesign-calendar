/**
 * @ldesign/calendar - DOM 渲染器
 * 负责渲染日历的 UI 框架（头部、工具栏、网格结构）
 */

import type { CalendarConfig, CalendarView, ToolbarConfig } from '../types';
import { BaseRenderer } from './base-renderer';
import { formatDate, getMonthName } from '../utils/date-utils';

/**
 * DOM 渲染器
 */
export class DOMRenderer extends BaseRenderer {
  private headerElement?: HTMLElement;
  private toolbarElement?: HTMLElement;
  private bodyElement?: HTMLElement;

  render(): void {
    this.clearContainer();
    this.addClass(this.container, 'ldesign-calendar');

    // 渲染工具栏
    if (this.config.toolbar !== false) {
      this.toolbarElement = this.renderToolbar();
      this.container.appendChild(this.toolbarElement);
    }

    // 渲染头部
    this.headerElement = this.renderHeader();
    this.container.appendChild(this.headerElement);

    // 渲染主体容器
    this.bodyElement = this.createElement('div', 'ldesign-calendar-body');
    this.container.appendChild(this.bodyElement);

    // 设置容器尺寸
    this.applyDimensions();
  }

  /**
   * 渲染工具栏
   */
  renderToolbar(): HTMLElement {
    const toolbar = this.createElement('div', 'ldesign-calendar-toolbar');
    const config = this.config.toolbar || {} as ToolbarConfig;

    // 左侧按钮组
    const leftGroup = this.createElement('div', 'ldesign-calendar-toolbar-left');

    if (config.today !== false) {
      const todayBtn = this.createElement('button', 'ldesign-calendar-btn');
      todayBtn.textContent = '今天';
      todayBtn.setAttribute('data-action', 'today');
      leftGroup.appendChild(todayBtn);
    }

    if (config.navigation !== false) {
      const prevBtn = this.createElement('button', 'ldesign-calendar-btn');
      prevBtn.textContent = '◀';
      prevBtn.setAttribute('data-action', 'prev');
      leftGroup.appendChild(prevBtn);

      const nextBtn = this.createElement('button', 'ldesign-calendar-btn');
      nextBtn.textContent = '▶';
      nextBtn.setAttribute('data-action', 'next');
      leftGroup.appendChild(nextBtn);
    }

    toolbar.appendChild(leftGroup);

    // 中间标题
    if (config.title !== false) {
      const title = this.createElement('div', 'ldesign-calendar-toolbar-title');
      title.setAttribute('data-role', 'title');
      toolbar.appendChild(title);
    }

    // 右侧视图切换
    if (config.viewSwitcher !== false) {
      const rightGroup = this.createElement('div', 'ldesign-calendar-toolbar-right');

      const views = [
        { value: 'month', label: '月' },
        { value: 'week', label: '周' },
        { value: 'day', label: '日' },
        { value: 'agenda', label: '日程' },
      ];

      views.forEach(view => {
        const btn = this.createElement('button', 'ldesign-calendar-btn');
        btn.textContent = view.label;
        btn.setAttribute('data-action', 'view');
        btn.setAttribute('data-view', view.value);
        rightGroup.appendChild(btn);
      });

      toolbar.appendChild(rightGroup);
    }

    // 自定义按钮
    if (config.customButtons && config.customButtons.length > 0) {
      const customGroup = this.createElement('div', 'ldesign-calendar-toolbar-custom');

      config.customButtons.forEach(btnConfig => {
        const btn = this.createElement('button', 'ldesign-calendar-btn');
        btn.textContent = btnConfig.text;
        if (btnConfig.icon) {
          btn.setAttribute('data-icon', btnConfig.icon);
        }
        customGroup.appendChild(btn);
      });

      toolbar.appendChild(customGroup);
    }

    return toolbar;
  }

  /**
   * 渲染头部（日期标题）
   */
  renderHeader(): HTMLElement {
    const header = this.createElement('div', 'ldesign-calendar-header');
    return header;
  }

  /**
   * 更新标题
   */
  updateTitle(date: Date, view: CalendarView): void {
    const titleElement = this.toolbarElement?.querySelector('[data-role="title"]');
    if (!titleElement) return;

    let title = '';

    switch (view) {
      case 'month':
        title = `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
        break;
      case 'week':
        title = `${date.getFullYear()}年 第${this.getWeekNumber(date)}周`;
        break;
      case 'day':
        title = formatDate(date, 'YYYY年MM月DD日');
        break;
      case 'agenda':
        title = '日程列表';
        break;
    }

    titleElement.textContent = title;
  }

  /**
   * 渲染日期网格（月视图）
   */
  renderDateGrid(dates: Date[], currentMonth: Date): HTMLElement {
    const grid = this.createElement('div', 'ldesign-calendar-grid');

    // 渲染星期头
    const weekHeader = this.renderWeekHeader();
    grid.appendChild(weekHeader);

    // 渲染日期单元格
    const cells = this.createElement('div', 'ldesign-calendar-cells');

    dates.forEach(date => {
      const cell = this.renderDateCell(date, currentMonth);
      cells.appendChild(cell);
    });

    grid.appendChild(cells);
    return grid;
  }

  /**
   * 渲染星期头
   */
  renderWeekHeader(): HTMLElement {
    const header = this.createElement('div', 'ldesign-calendar-week-header');
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

    weekdays.forEach(day => {
      const cell = this.createElement('div', 'ldesign-calendar-week-cell');
      cell.textContent = day;
      header.appendChild(cell);
    });

    return header;
  }

  /**
   * 渲染日期单元格
   */
  renderDateCell(date: Date, currentMonth: Date): HTMLElement {
    const cell = this.createElement('div', 'ldesign-calendar-date-cell');
    cell.setAttribute('data-date', date.toISOString());

    // 日期数字
    const number = this.createElement('div', 'ldesign-calendar-date-number');
    number.textContent = String(date.getDate());
    cell.appendChild(number);

    // 事件容器
    const eventsContainer = this.createElement('div', 'ldesign-calendar-events-container');
    cell.appendChild(eventsContainer);

    // 添加状态类
    if (date.getMonth() !== currentMonth.getMonth()) {
      this.addClass(cell, 'other-month');
    }

    if (this.isToday(date)) {
      this.addClass(cell, 'today');
    }

    if (this.isWeekend(date)) {
      this.addClass(cell, 'weekend');
    }

    return cell;
  }

  /**
   * 渲染时间轴（周/日视图）
   */
  renderTimeAxis(hours: number[]): HTMLElement {
    const axis = this.createElement('div', 'ldesign-calendar-time-axis');

    hours.forEach(hour => {
      const cell = this.createElement('div', 'ldesign-calendar-time-cell');
      const label = this.createElement('div', 'ldesign-calendar-time-label');
      label.textContent = `${String(hour).padStart(2, '0')}:00`;
      cell.appendChild(label);
      axis.appendChild(cell);
    });

    return axis;
  }

  /**
   * 渲染周视图容器
   */
  renderWeekView(dates: Date[]): HTMLElement {
    const container = this.createElement('div', 'ldesign-calendar-week-view');

    // 渲染日期头
    const header = this.createElement('div', 'ldesign-calendar-week-header');
    dates.forEach(date => {
      const cell = this.createElement('div', 'ldesign-calendar-week-day-header');
      cell.innerHTML = `
        <div class="ldesign-calendar-day-name">${this.getWeekdayName(date)}</div>
        <div class="ldesign-calendar-day-number">${date.getDate()}</div>
      `;

      if (this.isToday(date)) {
        this.addClass(cell, 'today');
      }

      header.appendChild(cell);
    });
    container.appendChild(header);

    // 渲染时间网格
    const grid = this.createElement('div', 'ldesign-calendar-week-grid');
    const timeAxis = this.renderTimeAxis(this.getHours());
    grid.appendChild(timeAxis);

    // 渲染每一天的列
    const columns = this.createElement('div', 'ldesign-calendar-week-columns');
    dates.forEach(date => {
      const column = this.createElement('div', 'ldesign-calendar-week-column');
      column.setAttribute('data-date', date.toISOString());
      columns.appendChild(column);
    });
    grid.appendChild(columns);

    container.appendChild(grid);
    return container;
  }

  /**
   * 获取主体容器
   */
  getBodyElement(): HTMLElement | undefined {
    return this.bodyElement;
  }

  /**
   * 应用尺寸
   */
  private applyDimensions(): void {
    if (this.config.height) {
      if (typeof this.config.height === 'number') {
        this.setStyle(this.container, { height: `${this.config.height}px` });
      } else {
        this.setStyle(this.container, { height: this.config.height });
      }
    }

    if (this.config.width) {
      if (typeof this.config.width === 'number') {
        this.setStyle(this.container, { width: `${this.config.width}px` });
      } else {
        this.setStyle(this.container, { width: this.config.width });
      }
    }
  }

  /**
   * 判断是否是今天
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  /**
   * 判断是否是周末
   */
  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  /**
   * 获取周数
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * 获取星期名称
   */
  private getWeekdayName(date: Date): string {
    const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return names[date.getDay()];
  }

  /**
   * 获取小时数组
   */
  private getHours(): number[] {
    const start = this.config.businessHoursStart || 0;
    const end = this.config.businessHoursEnd || 24;
    const hours: number[] = [];

    for (let i = start; i < end; i++) {
      hours.push(i);
    }

    return hours;
  }

  destroy(): void {
    this.clearContainer();
    this.headerElement = undefined;
    this.toolbarElement = undefined;
    this.bodyElement = undefined;
  }
}

