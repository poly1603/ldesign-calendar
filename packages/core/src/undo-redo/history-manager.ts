/**
 * @ldesign/calendar-core - 历史管理器
 * 管理命令历史，支持撤销/重做
 */

import type { Command } from './command'

/**
 * 历史管理器配置
 */
export interface HistoryManagerOptions {
  /** 最大历史记录数 */
  maxSize?: number
}

/**
 * 历史管理器事件
 */
export interface HistoryEvents {
  /** 执行命令后触发 */
  execute: (command: Command) => void
  /** 撤销后触发 */
  undo: (command: Command) => void
  /** 重做后触发 */
  redo: (command: Command) => void
  /** 历史变化后触发 */
  change: () => void
}

/**
 * 历史管理器类
 */
export class HistoryManager {
  private undoStack: Command[] = []
  private redoStack: Command[] = []
  private readonly maxSize: number
  private readonly listeners = new Map<keyof HistoryEvents, Set<Function>>()

  /**
   * 创建历史管理器
   * @param options - 配置选项
   */
  constructor(options: HistoryManagerOptions = {}) {
    this.maxSize = options.maxSize ?? 50
  }

  /**
   * 执行命令
   * @param command - 要执行的命令
   */
  async execute(command: Command): Promise<void> {
    await command.execute()

    // 添加到撤销栈
    this.undoStack.push(command)

    // 限制栈大小
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift()
    }

    // 清空重做栈
    this.redoStack = []

    // 触发事件
    this.emit('execute', command)
    this.emit('change')
  }

  /**
   * 撤销
   */
  async undo(): Promise<void> {
    if (!this.canUndo()) {
      return
    }

    const command = this.undoStack.pop()!
    await command.undo()

    // 添加到重做栈
    this.redoStack.push(command)

    // 触发事件
    this.emit('undo', command)
    this.emit('change')
  }

  /**
   * 重做
   */
  async redo(): Promise<void> {
    if (!this.canRedo()) {
      return
    }

    const command = this.redoStack.pop()!

    // 执行重做（如果有自定义redo方法则使用，否则使用execute）
    if (command.redo) {
      await command.redo()
    }
    else {
      await command.execute()
    }

    // 添加到撤销栈
    this.undoStack.push(command)

    // 触发事件
    this.emit('redo', command)
    this.emit('change')
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /**
   * 清空历史
   */
  clear(): void {
    this.undoStack = []
    this.redoStack = []
    this.emit('change')
  }

  /**
   * 获取撤销栈大小
   */
  get undoSize(): number {
    return this.undoStack.length
  }

  /**
   * 获取重做栈大小
   */
  get redoSize(): number {
    return this.redoStack.length
  }

  /**
   * 获取最后一个撤销命令
   */
  getLastUndoCommand(): Command | null {
    return this.undoStack[this.undoStack.length - 1] ?? null
  }

  /**
   * 获取最后一个重做命令
   */
  getLastRedoCommand(): Command | null {
    return this.redoStack[this.redoStack.length - 1] ?? null
  }

  /**
   * 监听事件
   */
  on<K extends keyof HistoryEvents>(event: K, listener: HistoryEvents[K]): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(listener)

    // 返回取消监听函数
    return () => this.off(event, listener)
  }

  /**
   * 取消监听
   */
  off<K extends keyof HistoryEvents>(event: K, listener: HistoryEvents[K]): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.delete(listener)
    }
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof HistoryEvents>(event: K, ...args: Parameters<HistoryEvents[K]>): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      for (const listener of listeners) {
        (listener as Function)(...args)
      }
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clear()
    this.listeners.clear()
  }
}

/**
 * 创建历史管理器的便捷函数
 */
export function createHistoryManager(options?: HistoryManagerOptions): HistoryManager {
  return new HistoryManager(options)
}
