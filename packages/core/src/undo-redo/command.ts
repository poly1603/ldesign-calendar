/**
 * @ldesign/calendar-core - 命令模式接口
 * 用于实现撤销/重做功能
 */

/**
 * 命令接口
 */
export interface Command {
  /**
   * 执行命令
   */
  execute(): void | Promise<void>

  /**
   * 撤销命令
   */
  undo(): void | Promise<void>

  /**
   * 重做命令（默认调用execute）
   */
  redo?(): void | Promise<void>

  /**
   * 命令描述（用于调试）
   */
  description?: string
}

/**
 * 抽象命令类
 */
export abstract class AbstractCommand implements Command {
  public description?: string

  constructor(description?: string) {
    this.description = description
  }

  abstract execute(): void | Promise<void>
  abstract undo(): void | Promise<void>

  /**
   * 默认重做实现（调用execute）
   */
  redo(): void | Promise<void> {
    return this.execute()
  }
}
