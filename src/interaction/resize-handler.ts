/**
 * @ldesign/calendar - 调整大小处理器
 */

import type { CalendarEvent, ResizeInfo } from '../types';

/**
 * 调整大小处理器
 */
export class ResizeHandler {
  private resizingEvent: CalendarEvent | null = null;
  private resizeInfo: ResizeInfo | null = null;
  private isResizing = false;
  private container: HTMLElement;
  private onResizeEnd?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * 设置调整大小结束回调
   */
  setOnResizeEnd(callback: (event: CalendarEvent, newStart: Date, newEnd: Date) => void): void {
    this.onResizeEnd = callback;
  }

  /**
   * 开始调整大小
   */
  startResize(event: CalendarEvent, edge: 'start' | 'end', mouseEvent: MouseEvent): void {
    this.resizingEvent = event;
    this.isResizing = true;

    this.resizeInfo = {
      event,
      edge,
      startY: mouseEvent.clientY,
      currentY: mouseEvent.clientY,
      originalStart: new Date(event.start),
      originalEnd: new Date(event.end),
    };
  }

  /**
   * 停止调整大小
   */
  stopResize(): void {
    if (this.isResizing && this.resizeInfo && this.onResizeEnd) {
      const { newStart, newEnd } = this.calculateNewTimes();

      if (newStart && newEnd) {
        this.onResizeEnd(this.resizeInfo.event, newStart, newEnd);
      }
    }

    this.reset();
  }

  /**
   * 取消调整大小
   */
  cancelResize(): void {
    this.reset();
  }

  /**
   * 是否正在调整大小
   */
  isResizingEvent(): boolean {
    return this.isResizing;
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.reset();
  }

  /**
   * 计算新的时间
   */
  private calculateNewTimes(): { newStart: Date; newEnd: Date } | { newStart: null; newEnd: null } {
    if (!this.resizeInfo) return { newStart: null, newEnd: null };

    const deltaY = this.resizeInfo.currentY - this.resizeInfo.startY;
    const minutesDelta = Math.round(deltaY / 2); // 假设2px = 1分钟

    let newStart = new Date(this.resizeInfo.originalStart);
    let newEnd = new Date(this.resizeInfo.originalEnd);

    if (this.resizeInfo.edge === 'start') {
      newStart = new Date(this.resizeInfo.originalStart.getTime() + minutesDelta * 60000);
    } else {
      newEnd = new Date(this.resizeInfo.originalEnd.getTime() + minutesDelta * 60000);
    }

    // 确保最小时长（30分钟）
    if (newEnd.getTime() - newStart.getTime() < 30 * 60000) {
      return { newStart: null, newEnd: null };
    }

    return { newStart, newEnd };
  }

  /**
   * 重置状态
   */
  private reset(): void {
    this.isResizing = false;
    this.resizingEvent = null;
    this.resizeInfo = null;
  }
}

