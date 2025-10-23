/**
 * @ldesign/calendar - 拖拽创建处理器
 */

import type { SelectInfo } from '../types';

/**
 * 拖拽创建处理器
 */
export class CreateHandler {
  private isSelecting = false;
  private selectInfo: SelectInfo | null = null;
  private container: HTMLElement;
  private onSelectEnd?: (start: Date, end: Date, allDay: boolean) => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * 设置选择结束回调
   */
  setOnSelectEnd(callback: (start: Date, end: Date, allDay: boolean) => void): void {
    this.onSelectEnd = callback;
  }

  /**
   * 开始选择
   */
  startSelect(start: Date, allDay: boolean = false): void {
    this.isSelecting = true;
    this.selectInfo = {
      start,
      end: start,
      allDay,
    };
  }

  /**
   * 更新选择范围
   */
  updateSelect(end: Date): void {
    if (this.selectInfo) {
      this.selectInfo.end = end;
    }
  }

  /**
   * 结束选择
   */
  endSelect(): void {
    if (this.isSelecting && this.selectInfo && this.onSelectEnd) {
      this.onSelectEnd(
        this.selectInfo.start,
        this.selectInfo.end,
        this.selectInfo.allDay
      );
    }

    this.reset();
  }

  /**
   * 取消选择
   */
  cancelSelect(): void {
    this.reset();
  }

  /**
   * 是否正在选择
   */
  isSelectingRange(): boolean {
    return this.isSelecting;
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.reset();
  }

  /**
   * 重置状态
   */
  private reset(): void {
    this.isSelecting = false;
    this.selectInfo = null;
  }
}

