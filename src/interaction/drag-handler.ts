/**
 * @ldesign/calendar - 拖拽处理器
 */

import type { CalendarEvent, DragInfo } from '../types';

/**
 * 拖拽处理器
 */
export class DragHandler {
  private draggingEvent: CalendarEvent | null = null;
  private dragInfo: DragInfo | null = null;
  private isDragging = false;
  private container: HTMLElement;
  private onDragEnd?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.bindEvents();
  }

  /**
   * 设置拖拽结束回调
   */
  setOnDragEnd(callback: (event: CalendarEvent, newStart: Date, newEnd: Date) => void): void {
    this.onDragEnd = callback;
  }

  /**
   * 开始拖拽
   */
  startDrag(event: CalendarEvent, mouseEvent: MouseEvent): void {
    this.draggingEvent = event;
    this.isDragging = true;

    this.dragInfo = {
      event,
      startX: mouseEvent.clientX,
      startY: mouseEvent.clientY,
      currentX: mouseEvent.clientX,
      currentY: mouseEvent.clientY,
      originalStart: new Date(event.start),
      originalEnd: new Date(event.end),
    };

    // 添加拖拽样式
    this.container.classList.add('ldesign-calendar-dragging');
  }

  /**
   * 停止拖拽
   */
  stopDrag(): void {
    if (this.isDragging && this.dragInfo && this.onDragEnd) {
      // 计算新的时间
      const { newStart, newEnd } = this.calculateNewTimes();

      if (newStart && newEnd) {
        this.onDragEnd(this.dragInfo.event, newStart, newEnd);
      }
    }

    this.reset();
  }

  /**
   * 取消拖拽
   */
  cancelDrag(): void {
    this.reset();
  }

  /**
   * 是否正在拖拽
   */
  isDraggingEvent(): boolean {
    return this.isDragging;
  }

  /**
   * 获取正在拖拽的事件
   */
  getDraggingEvent(): CalendarEvent | null {
    return this.draggingEvent;
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.unbindEvents();
    this.reset();
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    this.container.addEventListener('mousemove', this.handleMouseMove);
    this.container.addEventListener('mouseup', this.handleMouseUp);
  }

  /**
   * 解绑事件
   */
  private unbindEvents(): void {
    this.container.removeEventListener('mousemove', this.handleMouseMove);
    this.container.removeEventListener('mouseup', this.handleMouseUp);
  }

  /**
   * 处理鼠标移动
   */
  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isDragging || !this.dragInfo) return;

    this.dragInfo.currentX = e.clientX;
    this.dragInfo.currentY = e.clientY;

    // 更新视觉反馈（可在此处更新拖拽指示器）
  };

  /**
   * 处理鼠标释放
   */
  private handleMouseUp = (): void => {
    if (this.isDragging) {
      this.stopDrag();
    }
  };

  /**
   * 计算新的时间
   */
  private calculateNewTimes(): { newStart: Date; newEnd: Date } | { newStart: null; newEnd: null } {
    if (!this.dragInfo) return { newStart: null, newEnd: null };

    // 简化实现：计算拖拽的天数差
    const deltaX = this.dragInfo.currentX - this.dragInfo.startX;
    const daysDelta = Math.round(deltaX / 100); // 假设100px = 1天

    const duration = this.dragInfo.originalEnd.getTime() - this.dragInfo.originalStart.getTime();
    const newStart = new Date(this.dragInfo.originalStart.getTime() + daysDelta * 86400000);
    const newEnd = new Date(newStart.getTime() + duration);

    return { newStart, newEnd };
  }

  /**
   * 重置状态
   */
  private reset(): void {
    this.isDragging = false;
    this.draggingEvent = null;
    this.dragInfo = null;
    this.container.classList.remove('ldesign-calendar-dragging');
  }
}

