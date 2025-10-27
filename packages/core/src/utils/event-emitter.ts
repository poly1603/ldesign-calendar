/**
 * @ldesign/calendar-core - 优化的事件发射器
 * 修复异步回调处理和内存泄漏问题
 */

type EventCallback = (...args: any[]) => any;

/**
 * 事件发射器类
 */
export class EventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private maxListeners = 100; // 防止内存泄漏

  /**
   * 监听事件
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const eventListeners = this.listeners.get(event)!;

    // 检查监听器数量，防止内存泄漏
    if (eventListeners.size >= this.maxListeners) {
      console.warn(
        `Max listeners (${this.maxListeners}) exceeded for event "${event}". Possible memory leak.`
      );
    }

    eventListeners.add(callback);

    // 返回取消监听函数
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * 监听一次
   */
  once(event: string, callback: EventCallback): () => void {
    const wrappedCallback = (...args: any[]) => {
      this.off(event, wrappedCallback);
      return callback(...args);
    };

    return this.on(event, wrappedCallback);
  }

  /**
   * 取消监听
   */
  off(event: string, callback: EventCallback): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      // 如果没有监听器了，删除这个事件
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * 取消所有监听
   */
  offAll(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * 发射事件（支持异步回调）
   */
  async emit(event: string, ...args: any[]): Promise<any> {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.size === 0) {
      return undefined;
    }

    const results: any[] = [];
    const errors: Error[] = [];

    // 执行所有监听器（支持异步）
    for (const callback of eventListeners) {
      try {
        const result = await callback(...args);
        results.push(result);

        // 如果返回 false，停止传播
        if (result === false) {
          return false;
        }
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
        errors.push(error as Error);
      }
    }

    // 如果有错误，抛出第一个
    if (errors.length > 0) {
      throw errors[0];
    }

    // 返回最后一个结果
    return results.length > 0 ? results[results.length - 1] : undefined;
  }

  /**
   * 同步发射事件
   */
  emitSync(event: string, ...args: any[]): any {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.size === 0) {
      return undefined;
    }

    let lastResult: any;

    for (const callback of eventListeners) {
      try {
        const result = callback(...args);
        lastResult = result;

        // 如果返回 false，停止传播
        if (result === false) {
          return false;
        }
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    }

    return lastResult;
  }

  /**
   * 获取监听器数量
   */
  listenerCount(event?: string): number {
    if (event) {
      return this.listeners.get(event)?.size || 0;
    }

    let total = 0;
    for (const listeners of this.listeners.values()) {
      total += listeners.size;
    }
    return total;
  }

  /**
   * 设置最大监听器数量
   */
  setMaxListeners(max: number): void {
    this.maxListeners = max;
  }

  /**
   * 清理所有监听器（用于销毁）
   */
  destroy(): void {
    this.listeners.clear();
  }
}

