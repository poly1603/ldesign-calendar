/**
 * @ldesign/calendar - Canvas 渲染器
 * 用于高性能渲染大量事件
 */

import type { CalendarEvent, EventLayout, RenderOptions } from '../types';
import { getEventColor } from '../utils/event-utils';

/**
 * Canvas 渲染器
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpiScale: number;
  private options: RenderOptions;

  constructor(container: HTMLElement, options: RenderOptions = {}) {
    this.options = {
      dpiScale: window.devicePixelRatio || 1,
      showGrid: true,
      ...options,
    };

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'ldesign-calendar-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none'; // 让事件穿透到下层 DOM

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取 Canvas 2D 上下文');
    }
    this.ctx = ctx;
    this.dpiScale = this.options.dpiScale || 1;

    container.appendChild(this.canvas);
    this.resize(container.clientWidth, container.clientHeight);
  }

  /**
   * 调整 Canvas 大小
   */
  resize(width: number, height: number): void {
    // 设置 CSS 尺寸
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // 设置实际尺寸（考虑 DPI）
    this.canvas.width = width * this.dpiScale;
    this.canvas.height = height * this.dpiScale;

    // 缩放上下文
    this.ctx.scale(this.dpiScale, this.dpiScale);
  }

  /**
   * 清空画布
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 渲染事件块
   */
  renderEventBlock(
    event: CalendarEvent,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const colors = getEventColor(event);
    const padding = 2;
    const borderRadius = 4;

    // 绘制事件背景
    this.ctx.fillStyle = colors.backgroundColor;
    this.roundRect(
      x + padding,
      y + padding,
      width - padding * 2,
      height - padding * 2,
      borderRadius
    );
    this.ctx.fill();

    // 绘制边框
    this.ctx.strokeStyle = colors.borderColor;
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // 绘制文本
    this.ctx.fillStyle = colors.textColor;
    this.ctx.font = '12px sans-serif';
    this.ctx.textBaseline = 'top';

    const text = this.truncateText(event.title, width - padding * 4);
    this.ctx.fillText(text, x + padding + 4, y + padding + 4);
  }

  /**
   * 渲染多个事件
   */
  renderEvents(layouts: EventLayout[], cellWidth: number, cellHeight: number): void {
    this.clear();

    layouts.forEach(layout => {
      const x = (layout.left / 100) * cellWidth;
      const width = (layout.width / 100) * cellWidth;
      const y = layout.top || 0;
      const height = layout.height || cellHeight;

      this.renderEventBlock(layout.event, x, y, width, height);
    });
  }

  /**
   * 渲染网格线
   */
  renderGrid(
    rows: number,
    cols: number,
    cellWidth: number,
    cellHeight: number
  ): void {
    if (!this.options.showGrid) return;

    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 1;

    // 绘制垂直线
    for (let i = 0; i <= cols; i++) {
      const x = i * cellWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, rows * cellHeight);
      this.ctx.stroke();
    }

    // 绘制水平线
    for (let i = 0; i <= rows; i++) {
      const y = i * cellHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(cols * cellWidth, y);
      this.ctx.stroke();
    }
  }

  /**
   * 渲染时间线（当前时间指示器）
   */
  renderTimeline(y: number, width: number): void {
    if (!this.options.showTimeline) return;

    this.ctx.strokeStyle = '#ff5252';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);

    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(width, y);
    this.ctx.stroke();

    this.ctx.setLineDash([]); // 重置虚线

    // 绘制时间点
    this.ctx.fillStyle = '#ff5252';
    this.ctx.beginPath();
    this.ctx.arc(5, y, 4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * 获取 Canvas 元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }

  /**
   * 绘制圆角矩形
   */
  private roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  /**
   * 截断文本
   */
  private truncateText(text: string, maxWidth: number): string {
    const metrics = this.ctx.measureText(text);

    if (metrics.width <= maxWidth) {
      return text;
    }

    let truncated = text;
    while (this.ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }

    return truncated + '...';
  }
}

