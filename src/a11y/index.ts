/**
 * @ldesign/calendar - 无障碍性支持
 */

import type { CalendarEvent, CalendarView } from '../types';
import { getI18n } from '../i18n';

/**
 * ARIA 属性管理器
 */
export class A11yManager {
  private container: HTMLElement;
  private announcer: HTMLElement | null = null;
  private focusedElement: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupAria();
    this.createAnnouncer();
    this.setupKeyboardNavigation();
  }

  /**
   * 设置基础 ARIA 属性
   */
  private setupAria(): void {
    // 设置容器的 ARIA 属性
    this.container.setAttribute('role', 'application');
    this.container.setAttribute('aria-label', getI18n().t('ui.calendar'));
    this.container.setAttribute('tabindex', '0');
  }

  /**
   * 创建屏幕阅读器公告元素
   */
  private createAnnouncer(): void {
    this.announcer = document.createElement('div');
    this.announcer.className = 'ldesign-calendar-announcer';
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.style.position = 'absolute';
    this.announcer.style.left = '-10000px';
    this.announcer.style.width = '1px';
    this.announcer.style.height = '1px';
    this.announcer.style.overflow = 'hidden';
    this.container.appendChild(this.announcer);
  }

  /**
   * 设置键盘导航
   */
  private setupKeyboardNavigation(): void {
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key;
    const target = event.target as HTMLElement;

    // 日期单元格导航
    if (target.classList.contains('ldesign-calendar-date-cell')) {
      switch (key) {
        case 'ArrowLeft':
          event.preventDefault();
          this.focusPreviousDate(target);
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.focusNextDate(target);
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.focusPreviousWeek(target);
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.focusNextWeek(target);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          this.selectDate(target);
          break;
        case 'Home':
          event.preventDefault();
          this.focusFirstDate();
          break;
        case 'End':
          event.preventDefault();
          this.focusLastDate();
          break;
        case 'PageUp':
          event.preventDefault();
          if (event.shiftKey) {
            this.focusPreviousYear();
          } else {
            this.focusPreviousMonth();
          }
          break;
        case 'PageDown':
          event.preventDefault();
          if (event.shiftKey) {
            this.focusNextYear();
          } else {
            this.focusNextMonth();
          }
          break;
      }
    }

    // 事件导航
    if (target.classList.contains('ldesign-calendar-event')) {
      switch (key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          this.openEvent(target);
          break;
        case 'Delete':
          event.preventDefault();
          this.deleteEvent(target);
          break;
        case 'Tab':
          // 让默认的 Tab 行为工作
          break;
      }
    }

    // 全局快捷键
    switch (key) {
      case 't':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.goToToday();
        }
        break;
      case 'n':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.createNewEvent();
        }
        break;
      case '/':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.openSearch();
        }
        break;
    }
  }

  /**
   * 宣布消息给屏幕阅读器
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcer) return;

    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;

    // 清除消息以准备下一次宣布
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = '';
      }
    }, 1000);
  }

  /**
   * 设置日期单元格的 ARIA 属性
   */
  setDateCellAria(cell: HTMLElement, date: Date, events: CalendarEvent[] = []): void {
    const i18n = getI18n();
    const dateStr = i18n.formatDate(date, 'long');
    const eventCount = events.length;

    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('tabindex', '-1');
    cell.setAttribute('aria-label', dateStr);

    if (eventCount > 0) {
      const eventText = eventCount === 1
        ? '1 event'
        : `${eventCount} events`;
      cell.setAttribute('aria-label', `${dateStr}, ${eventText}`);
    }

    // 标记今天
    const today = new Date();
    if (this.isSameDay(date, today)) {
      cell.setAttribute('aria-current', 'date');
    }
  }

  /**
   * 设置事件的 ARIA 属性
   */
  setEventAria(element: HTMLElement, event: CalendarEvent): void {
    const i18n = getI18n();
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');

    const startStr = i18n.formatDateTime(event.start);
    const endStr = i18n.formatDateTime(event.end);
    const label = `${event.title}, from ${startStr} to ${endStr}`;

    element.setAttribute('aria-label', label);

    if (event.description) {
      element.setAttribute('aria-describedby', `event-desc-${event.id}`);
    }
  }

  /**
   * 设置视图的 ARIA 属性
   */
  setViewAria(view: CalendarView, currentDate: Date): void {
    const i18n = getI18n();
    let label = '';

    switch (view) {
      case 'month':
        label = i18n.formatDate(currentDate, 'long');
        break;
      case 'week':
        label = `Week of ${i18n.formatDate(currentDate, 'long')}`;
        break;
      case 'day':
        label = i18n.formatDate(currentDate, 'full');
        break;
      case 'agenda':
        label = 'Agenda view';
        break;
    }

    this.container.setAttribute('aria-label', label);
    this.announce(label);
  }

  /**
   * 聚焦到上一个日期
   */
  private focusPreviousDate(current: HTMLElement): void {
    const cells = Array.from(this.container.querySelectorAll('.ldesign-calendar-date-cell'));
    const index = cells.indexOf(current);
    if (index > 0) {
      this.focusElement(cells[index - 1] as HTMLElement);
    }
  }

  /**
   * 聚焦到下一个日期
   */
  private focusNextDate(current: HTMLElement): void {
    const cells = Array.from(this.container.querySelectorAll('.ldesign-calendar-date-cell'));
    const index = cells.indexOf(current);
    if (index < cells.length - 1) {
      this.focusElement(cells[index + 1] as HTMLElement);
    }
  }

  /**
   * 聚焦到上一周
   */
  private focusPreviousWeek(current: HTMLElement): void {
    const cells = Array.from(this.container.querySelectorAll('.ldesign-calendar-date-cell'));
    const index = cells.indexOf(current);
    if (index >= 7) {
      this.focusElement(cells[index - 7] as HTMLElement);
    }
  }

  /**
   * 聚焦到下一周
   */
  private focusNextWeek(current: HTMLElement): void {
    const cells = Array.from(this.container.querySelectorAll('.ldesign-calendar-date-cell'));
    const index = cells.indexOf(current);
    if (index < cells.length - 7) {
      this.focusElement(cells[index + 7] as HTMLElement);
    }
  }

  /**
   * 聚焦到第一个日期
   */
  private focusFirstDate(): void {
    const firstCell = this.container.querySelector('.ldesign-calendar-date-cell') as HTMLElement;
    if (firstCell) {
      this.focusElement(firstCell);
    }
  }

  /**
   * 聚焦到最后一个日期
   */
  private focusLastDate(): void {
    const cells = this.container.querySelectorAll('.ldesign-calendar-date-cell');
    const lastCell = cells[cells.length - 1] as HTMLElement;
    if (lastCell) {
      this.focusElement(lastCell);
    }
  }

  /**
   * 聚焦元素
   */
  private focusElement(element: HTMLElement): void {
    if (this.focusedElement) {
      this.focusedElement.setAttribute('tabindex', '-1');
    }

    element.setAttribute('tabindex', '0');
    element.focus();
    this.focusedElement = element;

    // 宣布新的聚焦位置
    const label = element.getAttribute('aria-label');
    if (label) {
      this.announce(label);
    }
  }

  /**
   * 选择日期
   */
  private selectDate(cell: HTMLElement): void {
    // 触发日期选择事件
    const event = new CustomEvent('dateselect', {
      detail: { cell },
      bubbles: true
    });
    this.container.dispatchEvent(event);
    this.announce('Date selected');
  }

  /**
   * 打开事件
   */
  private openEvent(element: HTMLElement): void {
    // 触发事件打开
    const event = new CustomEvent('eventopen', {
      detail: { element },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 删除事件
   */
  private deleteEvent(element: HTMLElement): void {
    // 触发事件删除
    const event = new CustomEvent('eventdelete', {
      detail: { element },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * 跳转到今天
   */
  private goToToday(): void {
    const event = new CustomEvent('gototoday', { bubbles: true });
    this.container.dispatchEvent(event);
    this.announce('Navigated to today');
  }

  /**
   * 创建新事件
   */
  private createNewEvent(): void {
    const event = new CustomEvent('createevent', { bubbles: true });
    this.container.dispatchEvent(event);
    this.announce('Create new event dialog opened');
  }

  /**
   * 打开搜索
   */
  private openSearch(): void {
    const event = new CustomEvent('opensearch', { bubbles: true });
    this.container.dispatchEvent(event);
    this.announce('Search opened');
  }

  /**
   * 聚焦到上个月
   */
  private focusPreviousMonth(): void {
    const event = new CustomEvent('previousmonth', { bubbles: true });
    this.container.dispatchEvent(event);
  }

  /**
   * 聚焦到下个月
   */
  private focusNextMonth(): void {
    const event = new CustomEvent('nextmonth', { bubbles: true });
    this.container.dispatchEvent(event);
  }

  /**
   * 聚焦到上一年
   */
  private focusPreviousYear(): void {
    const event = new CustomEvent('previousyear', { bubbles: true });
    this.container.dispatchEvent(event);
  }

  /**
   * 聚焦到下一年
   */
  private focusNextYear(): void {
    const event = new CustomEvent('nextyear', { bubbles: true });
    this.container.dispatchEvent(event);
  }

  /**
   * 判断是否同一天
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.announcer) {
      this.announcer.remove();
      this.announcer = null;
    }
    this.container.removeEventListener('keydown', this.handleKeyDown);
  }
}

/**
 * 创建无障碍性管理器
 */
export function createA11yManager(container: HTMLElement): A11yManager {
  return new A11yManager(container);
}
