/**
 * @ldesign/calendar-core - 批处理器
 * 将多个操作合并为一次批量处理，减少重复计算
 */

/**
 * 批处理器配置
 */
export interface BatchProcessorOptions {
  /** 延迟时间（毫秒），默认16ms（约60fps） */
  delay?: number
  /** 最大批次大小 */
  maxBatchSize?: number
}

/**
 * 批处理器类
 * @template T - 批处理项的类型
 */
export class BatchProcessor<T> {
  private queue: T[] = []
  private readonly processor: (items: T[]) => void | Promise<void>
  private readonly delay: number
  private readonly maxBatchSize: number
  private timer: ReturnType<typeof setTimeout> | null = null
  private processing = false
  private destroyed = false

  /**
   * 创建批处理器
   * @param processor - 批处理函数
   * @param options - 配置选项
   */
  constructor(
    processor: (items: T[]) => void | Promise<void>,
    options: BatchProcessorOptions = {},
  ) {
    this.processor = processor
    this.delay = options.delay ?? 16 // 默认16ms，约60fps
    this.maxBatchSize = options.maxBatchSize ?? 1000
  }

  /**
   * 添加项到队列
   * @param item - 要添加的项
   */
  add(item: T): void {
    if (this.destroyed) return
    this.queue.push(item)

    // 如果达到最大批次大小，立即刷新
    if (this.queue.length >= this.maxBatchSize) {
      this.flush()
      return
    }

    // 否则延迟刷新
    this.scheduleFlush()
  }

  /**
   * 批量添加项
   * @param items - 要添加的项数组
   */
  addBatch(items: T[]): void {
    this.queue.push(...items)

    if (this.queue.length >= this.maxBatchSize) {
      this.flush()
    }
    else {
      this.scheduleFlush()
    }
  }

  /**
   * 调度刷新
   */
  private scheduleFlush(): void {
    if (this.timer !== null) {
      return
    }

    this.timer = setTimeout(() => {
      this.flush()
    }, this.delay)
  }

  /**
   * 立即刷新队列
   */
  flush(): void {
    // 如果已销毁，直接返回
    if (this.destroyed) return

    // 清除定时器
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }

    // 如果正在处理或队列为空，直接返回
    if (this.processing || this.queue.length === 0) {
      return
    }

    // 提取当前队列
    const items = this.queue.slice()
    this.queue = []

    // 标记为处理中
    this.processing = true

    // 执行批处理
    Promise.resolve(this.processor(items))
      .finally(() => {
        this.processing = false

        // 如果处理期间又有新项加入，继续处理
        if (this.queue.length > 0) {
          this.scheduleFlush()
        }
      })
  }

  /**
   * 清空队列
   */
  clear(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.queue = []
  }

  /**
   * 销毁批处理器
   */
  destroy(): void {
    this.destroyed = true
    this.clear()
    this.processing = false
  }

  /**
   * 获取队列大小
   */
  get size(): number {
    return this.queue.length
  }

  /**
   * 是否正在处理
   */
  get isProcessing(): boolean {
    return this.processing
  }
}

/**
 * 创建批处理器的便捷函数
 */
export function createBatchProcessor<T>(
  processor: (items: T[]) => void | Promise<void>,
  options?: BatchProcessorOptions,
): BatchProcessor<T> {
  return new BatchProcessor(processor, options)
}
