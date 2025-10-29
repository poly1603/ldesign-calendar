/**
 * @ldesign/calendar-core - 错误类型定义
 */

/**
 * 错误代码枚举
 */
export enum ErrorCode {
  /** 无效的配置 */
  INVALID_CONFIG = 'INVALID_CONFIG',
  /** 无效的事件数据 */
  INVALID_EVENT = 'INVALID_EVENT',
  /** 无效的日期 */
  INVALID_DATE = 'INVALID_DATE',
  /** 无效的视图类型 */
  INVALID_VIEW = 'INVALID_VIEW',
  /** 存储错误 */
  STORAGE_ERROR = 'STORAGE_ERROR',
  /** 渲染错误 */
  RENDER_ERROR = 'RENDER_ERROR',
  /** 网络错误 */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** 插件错误 */
  PLUGIN_ERROR = 'PLUGIN_ERROR',
  /** Worker错误 */
  WORKER_ERROR = 'WORKER_ERROR',
  /** 未知错误 */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 日历错误类
 */
export class CalendarError extends Error {
  /** 错误代码 */
  public code: ErrorCode

  /** 错误详情 */
  public details?: unknown

  /** 时间戳 */
  public timestamp: number

  constructor(message: string, code: ErrorCode = ErrorCode.UNKNOWN_ERROR, details?: unknown) {
    super(message)
    this.name = 'CalendarError'
    this.code = code
    this.details = details
    this.timestamp = Date.now()

    // 维护原型链
    Object.setPrototypeOf(this, CalendarError.prototype)
  }

  /**
   * 转换为JSON对象
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    }
  }

  /**
   * 格式化错误信息
   */
  toString(): string {
    return `[${this.code}] ${this.message}`
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends CalendarError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.INVALID_EVENT, details)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * 存储错误类
 */
export class StorageError extends CalendarError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.STORAGE_ERROR, details)
    this.name = 'StorageError'
    Object.setPrototypeOf(this, StorageError.prototype)
  }
}

/**
 * 渲染错误类
 */
export class RenderError extends CalendarError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.RENDER_ERROR, details)
    this.name = 'RenderError'
    Object.setPrototypeOf(this, RenderError.prototype)
  }
}

/**
 * 网络错误类
 */
export class NetworkError extends CalendarError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.NETWORK_ERROR, details)
    this.name = 'NetworkError'
    Object.setPrototypeOf(this, NetworkError.prototype)
  }
}

/**
 * 插件错误类
 */
export class PluginError extends CalendarError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.PLUGIN_ERROR, details)
    this.name = 'PluginError'
    Object.setPrototypeOf(this, PluginError.prototype)
  }
}

/**
 * 错误处理器类型
 */
export type ErrorHandler = (error: CalendarError) => void

/**
 * 错误选项
 */
export interface ErrorOptions {
  /** 是否显示详细错误信息 */
  verbose?: boolean
  /** 自定义错误处理器 */
  handler?: ErrorHandler
  /** 是否在控制台输出错误 */
  logToConsole?: boolean
}
