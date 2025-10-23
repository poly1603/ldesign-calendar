/**
 * @ldesign/calendar - 基础渲染器
 */

import type { CalendarConfig, CalendarEvent, CalendarView } from '../types';

/**
 * 渲染器基类
 */
export abstract class BaseRenderer {
  protected container: HTMLElement;
  protected config: CalendarConfig;

  constructor(container: HTMLElement, config: CalendarConfig) {
    this.container = container;
    this.config = config;
  }

  /**
   * 渲染
   */
  abstract render(): void;

  /**
   * 销毁
   */
  abstract destroy(): void;

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CalendarConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 创建元素
   */
  protected createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    attributes?: Record<string, string>
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }

    return element;
  }

  /**
   * 清空容器
   */
  protected clearContainer(): void {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }

  /**
   * 添加 CSS 类
   */
  protected addClass(element: HTMLElement, ...classNames: string[]): void {
    element.classList.add(...classNames);
  }

  /**
   * 移除 CSS 类
   */
  protected removeClass(element: HTMLElement, ...classNames: string[]): void {
    element.classList.remove(...classNames);
  }

  /**
   * 切换 CSS 类
   */
  protected toggleClass(element: HTMLElement, className: string, force?: boolean): void {
    element.classList.toggle(className, force);
  }

  /**
   * 设置样式
   */
  protected setStyle(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    Object.assign(element.style, styles);
  }
}

