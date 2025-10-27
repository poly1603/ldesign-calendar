/**
 * 事件提醒引擎 - 管理事件提醒和通知
 * @module reminder-engine
 */

import type { CalendarEvent } from '../types';

export interface ReminderConfig {
  /** 是否启用提醒 */
  enabled?: boolean;
  /** 是否启用声音提醒 */
  sound?: boolean;
  /** 声音文件URL */
  soundUrl?: string;
  /** 是否启用浏览器通知 */
  notification?: boolean;
  /** 是否启用弹窗提醒 */
  popup?: boolean;
  /** 默认提醒提前时间（分钟） */
  defaultAdvanceTime?: number;
  /** 提醒检查间隔（秒） */
  checkInterval?: number;
  /** 重复提醒间隔（分钟） */
  snoozeInterval?: number;
  /** 最大重复提醒次数 */
  maxSnoozeCount?: number;
}

export interface Reminder {
  /** 提醒ID */
  id: string;
  /** 事件ID */
  eventId: string;
  /** 提醒时间 */
  time: Date;
  /** 提前时间（分钟） */
  advanceTime: number;
  /** 提醒类型 */
  type: 'popup' | 'notification' | 'sound' | 'all';
  /** 提醒消息 */
  message?: string;
  /** 是否已触发 */
  triggered: boolean;
  /** 触发次数 */
  triggerCount: number;
  /** 是否已关闭 */
  dismissed: boolean;
  /** 延后时间 */
  snoozedUntil?: Date;
}

export interface ReminderCallback {
  onReminder?: (reminder: Reminder, event: CalendarEvent) => void;
  onSnooze?: (reminder: Reminder, minutes: number) => void;
  onDismiss?: (reminder: Reminder) => void;
}

export class ReminderEngine {
  private config: Required<ReminderConfig>;
  private reminders: Map<string, Reminder> = new Map();
  private events: Map<string, CalendarEvent> = new Map();
  private checkTimer: number | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private notificationPermission: NotificationPermission = 'default';
  private callbacks: ReminderCallback = {};
  private activePopups: Map<string, any> = new Map();

  constructor(config: ReminderConfig = {}) {
    this.config = {
      enabled: config.enabled !== false,
      sound: config.sound !== false,
      soundUrl: config.soundUrl || '/sounds/reminder.mp3',
      notification: config.notification !== false,
      popup: config.popup !== false,
      defaultAdvanceTime: config.defaultAdvanceTime || 15,
      checkInterval: config.checkInterval || 60,
      snoozeInterval: config.snoozeInterval || 5,
      maxSnoozeCount: config.maxSnoozeCount || 3,
    };

    if (this.config.enabled) {
      this.initialize();
    }
  }

  /**
   * 初始化提醒引擎
   */
  private async initialize(): Promise<void> {
    // 请求通知权限
    if (this.config.notification && 'Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }

    // 预加载声音
    if (this.config.sound) {
      this.audioElement = new Audio(this.config.soundUrl);
      this.audioElement.preload = 'auto';
    }

    // 启动检查定时器
    this.startCheckTimer();
  }

  /**
   * 启动检查定时器
   */
  private startCheckTimer(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }

    this.checkTimer = window.setInterval(() => {
      this.checkReminders();
    }, this.config.checkInterval * 1000);

    // 立即执行一次检查
    this.checkReminders();
  }

  /**
   * 停止检查定时器
   */
  private stopCheckTimer(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }

  /**
   * 添加事件
   */
  public addEvent(event: CalendarEvent): void {
    this.events.set(event.id, event);

    // 创建默认提醒
    if (!this.reminders.has(event.id)) {
      this.createReminder(event, this.config.defaultAdvanceTime);
    }
  }

  /**
   * 更新事件
   */
  public updateEvent(event: CalendarEvent): void {
    this.events.set(event.id, event);

    // 更新提醒时间
    const reminder = this.reminders.get(event.id);
    if (reminder) {
      reminder.time = new Date(event.start.getTime() - reminder.advanceTime * 60 * 1000);
      reminder.triggered = false;
      reminder.dismissed = false;
    }
  }

  /**
   * 删除事件
   */
  public removeEvent(eventId: string): void {
    this.events.delete(eventId);
    this.reminders.delete(eventId);

    // 关闭相关弹窗
    const popup = this.activePopups.get(eventId);
    if (popup) {
      this.closePopup(eventId);
    }
  }

  /**
   * 创建提醒
   */
  public createReminder(
    event: CalendarEvent,
    advanceTime: number = this.config.defaultAdvanceTime,
    type: Reminder['type'] = 'all',
    message?: string
  ): Reminder {
    const reminder: Reminder = {
      id: `reminder-${event.id}`,
      eventId: event.id,
      time: new Date(event.start.getTime() - advanceTime * 60 * 1000),
      advanceTime,
      type,
      message: message || this.generateReminderMessage(event),
      triggered: false,
      triggerCount: 0,
      dismissed: false,
    };

    this.reminders.set(event.id, reminder);
    return reminder;
  }

  /**
   * 更新提醒设置
   */
  public updateReminder(eventId: string, updates: Partial<Reminder>): void {
    const reminder = this.reminders.get(eventId);
    if (reminder) {
      Object.assign(reminder, updates);

      // 如果更新了提前时间，重新计算提醒时间
      if (updates.advanceTime !== undefined) {
        const event = this.events.get(eventId);
        if (event) {
          reminder.time = new Date(event.start.getTime() - updates.advanceTime * 60 * 1000);
        }
      }
    }
  }

  /**
   * 检查提醒
   */
  private checkReminders(): void {
    const now = new Date();

    this.reminders.forEach((reminder, eventId) => {
      // 跳过已关闭或延后的提醒
      if (reminder.dismissed || (reminder.snoozedUntil && now < reminder.snoozedUntil)) {
        return;
      }

      // 检查是否到达提醒时间
      if (!reminder.triggered && now >= reminder.time) {
        const event = this.events.get(eventId);
        if (event && event.start > now) {
          this.triggerReminder(reminder, event);
        }
      }
    });
  }

  /**
   * 触发提醒
   */
  private triggerReminder(reminder: Reminder, event: CalendarEvent): void {
    reminder.triggered = true;
    reminder.triggerCount++;

    // 执行回调
    if (this.callbacks.onReminder) {
      this.callbacks.onReminder(reminder, event);
    }

    // 根据类型触发不同的提醒方式
    if (reminder.type === 'all' || reminder.type === 'sound') {
      this.playSound();
    }

    if (reminder.type === 'all' || reminder.type === 'notification') {
      this.showNotification(reminder, event);
    }

    if (reminder.type === 'all' || reminder.type === 'popup') {
      this.showPopup(reminder, event);
    }
  }

  /**
   * 播放提醒声音
   */
  private playSound(): void {
    if (this.config.sound && this.audioElement) {
      this.audioElement.play().catch(error => {
        console.warn('Failed to play reminder sound:', error);
      });
    }
  }

  /**
   * 显示浏览器通知
   */
  private showNotification(reminder: Reminder, event: CalendarEvent): void {
    if (!this.config.notification || this.notificationPermission !== 'granted') {
      return;
    }

    const notification = new Notification(event.title, {
      body: reminder.message,
      icon: '/icons/calendar.png',
      tag: reminder.id,
      requireInteraction: true,
      actions: [
        { action: 'snooze', title: '延后5分钟' },
        { action: 'dismiss', title: '关闭' },
      ],
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    notification.onclose = () => {
      if (!reminder.dismissed) {
        this.dismissReminder(reminder.eventId);
      }
    };

    // 处理动作按钮（某些浏览器支持）
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('notificationclick', (event: any) => {
        if (event.notification.tag === reminder.id) {
          if (event.action === 'snooze') {
            this.snoozeReminder(reminder.eventId, this.config.snoozeInterval);
          } else if (event.action === 'dismiss') {
            this.dismissReminder(reminder.eventId);
          }
          event.notification.close();
        }
      });
    }
  }

  /**
   * 显示弹窗提醒
   */
  private showPopup(reminder: Reminder, event: CalendarEvent): void {
    if (!this.config.popup) return;

    // 创建弹窗容器
    const popup = document.createElement('div');
    popup.className = 'ldesign-calendar-reminder-popup';
    popup.innerHTML = `
      <div class="ldesign-calendar-reminder-popup__content">
        <div class="ldesign-calendar-reminder-popup__header">
          <h3 class="ldesign-calendar-reminder-popup__title">事件提醒</h3>
          <button class="ldesign-calendar-reminder-popup__close" data-action="close">&times;</button>
        </div>
        <div class="ldesign-calendar-reminder-popup__body">
          <h4 class="ldesign-calendar-reminder-popup__event-title">${event.title}</h4>
          <p class="ldesign-calendar-reminder-popup__message">${reminder.message}</p>
          <p class="ldesign-calendar-reminder-popup__time">
            开始时间：${this.formatDateTime(event.start)}
          </p>
          ${event.location ? `<p class="ldesign-calendar-reminder-popup__location">地点：${event.location}</p>` : ''}
        </div>
        <div class="ldesign-calendar-reminder-popup__actions">
          <button class="ldesign-calendar-reminder-popup__button" data-action="snooze">延后5分钟</button>
          <button class="ldesign-calendar-reminder-popup__button ldesign-calendar-reminder-popup__button--primary" data-action="dismiss">我知道了</button>
        </div>
      </div>
    `;

    // 添加样式
    this.addPopupStyles();

    // 添加到页面
    document.body.appendChild(popup);
    this.activePopups.set(event.id, popup);

    // 绑定事件
    popup.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const action = target.dataset.action;

      if (action === 'close' || action === 'dismiss') {
        this.dismissReminder(reminder.eventId);
        this.closePopup(event.id);
      } else if (action === 'snooze') {
        this.snoozeReminder(reminder.eventId, this.config.snoozeInterval);
        this.closePopup(event.id);
      }
    });

    // 自动关闭
    setTimeout(() => {
      if (this.activePopups.has(event.id)) {
        this.closePopup(event.id);
      }
    }, 60000); // 60秒后自动关闭
  }

  /**
   * 关闭弹窗
   */
  private closePopup(eventId: string): void {
    const popup = this.activePopups.get(eventId);
    if (popup) {
      popup.remove();
      this.activePopups.delete(eventId);
    }
  }

  /**
   * 添加弹窗样式
   */
  private addPopupStyles(): void {
    if (document.querySelector('#ldesign-calendar-reminder-styles')) return;

    const style = document.createElement('style');
    style.id = 'ldesign-calendar-reminder-styles';
    style.textContent = `
      .ldesign-calendar-reminder-popup {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        width: 360px;
        background: var(--color-bg-container, #fff);
        border-radius: var(--border-radius-lg, 8px);
        box-shadow: var(--shadow-3, 0 6px 16px rgba(0, 0, 0, 0.12));
        animation: slideIn 0.3s ease-out;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .ldesign-calendar-reminder-popup__content {
        padding: 0;
      }
      
      .ldesign-calendar-reminder-popup__header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--color-border, #f0f0f0);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .ldesign-calendar-reminder-popup__title {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text, #262626);
      }
      
      .ldesign-calendar-reminder-popup__close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--color-text-tertiary, #bfbfbf);
        line-height: 1;
        padding: 0;
      }
      
      .ldesign-calendar-reminder-popup__close:hover {
        color: var(--color-text-secondary, #8c8c8c);
      }
      
      .ldesign-calendar-reminder-popup__body {
        padding: 20px;
      }
      
      .ldesign-calendar-reminder-popup__event-title {
        margin: 0 0 12px;
        font-size: 18px;
        font-weight: 500;
        color: var(--color-text, #262626);
      }
      
      .ldesign-calendar-reminder-popup__message,
      .ldesign-calendar-reminder-popup__time,
      .ldesign-calendar-reminder-popup__location {
        margin: 8px 0;
        font-size: 14px;
        color: var(--color-text-secondary, #8c8c8c);
      }
      
      .ldesign-calendar-reminder-popup__actions {
        padding: 16px 20px;
        border-top: 1px solid var(--color-border, #f0f0f0);
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
      
      .ldesign-calendar-reminder-popup__button {
        padding: 6px 16px;
        border: 1px solid var(--color-border, #d9d9d9);
        border-radius: var(--border-radius, 4px);
        background: var(--color-bg-container, #fff);
        color: var(--color-text, #262626);
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .ldesign-calendar-reminder-popup__button:hover {
        border-color: var(--color-primary, #1890ff);
        color: var(--color-primary, #1890ff);
      }
      
      .ldesign-calendar-reminder-popup__button--primary {
        background: var(--color-primary, #1890ff);
        border-color: var(--color-primary, #1890ff);
        color: #fff;
      }
      
      .ldesign-calendar-reminder-popup__button--primary:hover {
        background: var(--color-primary-hover, #40a9ff);
        border-color: var(--color-primary-hover, #40a9ff);
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 延后提醒
   */
  public snoozeReminder(eventId: string, minutes: number): void {
    const reminder = this.reminders.get(eventId);
    if (reminder) {
      reminder.snoozedUntil = new Date(Date.now() + minutes * 60 * 1000);
      reminder.triggered = false;

      // 检查是否超过最大延后次数
      if (reminder.triggerCount >= this.config.maxSnoozeCount) {
        reminder.dismissed = true;
      }

      // 执行回调
      if (this.callbacks.onSnooze) {
        this.callbacks.onSnooze(reminder, minutes);
      }
    }
  }

  /**
   * 关闭提醒
   */
  public dismissReminder(eventId: string): void {
    const reminder = this.reminders.get(eventId);
    if (reminder) {
      reminder.dismissed = true;

      // 执行回调
      if (this.callbacks.onDismiss) {
        this.callbacks.onDismiss(reminder);
      }
    }
  }

  /**
   * 生成提醒消息
   */
  private generateReminderMessage(event: CalendarEvent): string {
    const minutes = Math.floor((event.start.getTime() - Date.now()) / (1000 * 60));

    if (minutes <= 0) {
      return '事件即将开始';
    } else if (minutes < 60) {
      return `事件将在 ${minutes} 分钟后开始`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `事件将在 ${hours} 小时 ${mins} 分钟后开始`;
    }
  }

  /**
   * 格式化日期时间
   */
  private formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  /**
   * 设置回调函数
   */
  public setCallbacks(callbacks: ReminderCallback): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * 获取提醒列表
   */
  public getReminders(): Reminder[] {
    return Array.from(this.reminders.values());
  }

  /**
   * 获取事件的提醒
   */
  public getEventReminder(eventId: string): Reminder | null {
    return this.reminders.get(eventId) || null;
  }

  /**
   * 启用/禁用提醒
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;

    if (enabled) {
      this.startCheckTimer();
    } else {
      this.stopCheckTimer();
    }
  }

  /**
   * 销毁提醒引擎
   */
  public destroy(): void {
    this.stopCheckTimer();
    this.reminders.clear();
    this.events.clear();

    // 关闭所有弹窗
    this.activePopups.forEach((popup, eventId) => {
      this.closePopup(eventId);
    });

    // 清理音频元素
    if (this.audioElement) {
      this.audioElement = null;
    }
  }
}

/**
 * 创建提醒引擎实例
 */
export function createReminderEngine(config?: ReminderConfig): ReminderEngine {
  return new ReminderEngine(config);
}

