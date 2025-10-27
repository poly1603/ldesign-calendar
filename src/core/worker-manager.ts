/**
 * Worker 管理器 - 管理 Web Worker 池和任务调度
 * @module worker-manager
 */

import type { WorkerMessage, WorkerResponse, ProcessedEvent } from '../workers/event-processor.worker';
import type { CalendarEvent } from '../types';

export interface WorkerTask {
  id: string;
  type: WorkerMessage['type'];
  data: any;
  resolve: (result: any) => void;
  reject: (error: Error) => void;
  timeout?: number;
}

export interface WorkerPoolConfig {
  /** Worker 池大小 */
  poolSize?: number;
  /** 任务超时时间（毫秒） */
  taskTimeout?: number;
  /** Worker 脚本路径 */
  workerPath?: string;
  /** 是否启用 Worker（某些环境可能不支持） */
  enabled?: boolean;
}

export class WorkerManager {
  private config: Required<WorkerPoolConfig>;
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: WorkerTask[] = [];
  private activeTasks: Map<string, WorkerTask> = new Map();
  private workerTaskMap: Map<Worker, string> = new Map();
  private taskIdCounter = 0;
  private isTerminated = false;

  constructor(config: WorkerPoolConfig = {}) {
    this.config = {
      poolSize: config.poolSize || navigator.hardwareConcurrency || 4,
      taskTimeout: config.taskTimeout || 30000,
      workerPath: config.workerPath || '/workers/event-processor.worker.js',
      enabled: config.enabled !== false && typeof Worker !== 'undefined',
    };

    if (this.config.enabled) {
      this.initializeWorkerPool();
    }
  }

  /**
   * 初始化 Worker 池
   */
  private initializeWorkerPool(): void {
    for (let i = 0; i < this.config.poolSize; i++) {
      this.createWorker();
    }
  }

  /**
   * 创建新的 Worker
   */
  private createWorker(): void {
    try {
      const worker = new Worker(this.config.workerPath, { type: 'module' });

      worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
        this.handleWorkerMessage(worker, event.data);
      });

      worker.addEventListener('error', (error) => {
        this.handleWorkerError(worker, error);
      });

      this.workers.push(worker);
      this.availableWorkers.push(worker);
    } catch (error) {
      console.error('Failed to create worker:', error);
      this.config.enabled = false;
    }
  }

  /**
   * 处理 Worker 消息
   */
  private handleWorkerMessage(worker: Worker, response: WorkerResponse): void {
    const taskId = this.workerTaskMap.get(worker);
    if (!taskId) return;

    const task = this.activeTasks.get(taskId);
    if (!task) return;

    // 清理任务
    this.activeTasks.delete(taskId);
    this.workerTaskMap.delete(worker);

    // 将 Worker 标记为可用
    this.availableWorkers.push(worker);

    // 处理响应
    if (response.error) {
      task.reject(new Error(response.error));
    } else {
      task.resolve(response.result);
    }

    // 处理队列中的下一个任务
    this.processNextTask();
  }

  /**
   * 处理 Worker 错误
   */
  private handleWorkerError(worker: Worker, error: ErrorEvent): void {
    console.error('Worker error:', error);

    const taskId = this.workerTaskMap.get(worker);
    if (taskId) {
      const task = this.activeTasks.get(taskId);
      if (task) {
        task.reject(new Error(`Worker error: ${error.message}`));
        this.activeTasks.delete(taskId);
      }
    }

    // 移除错误的 Worker
    const index = this.workers.indexOf(worker);
    if (index !== -1) {
      this.workers.splice(index, 1);
    }

    const availableIndex = this.availableWorkers.indexOf(worker);
    if (availableIndex !== -1) {
      this.availableWorkers.splice(availableIndex, 1);
    }

    this.workerTaskMap.delete(worker);
    worker.terminate();

    // 创建新的 Worker 替换
    if (!this.isTerminated) {
      this.createWorker();
    }
  }

  /**
   * 执行任务
   */
  private async executeTask<T>(
    type: WorkerMessage['type'],
    data: any,
    timeout?: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.config.enabled) {
        // 如果 Worker 不可用，在主线程执行
        this.executeInMainThread(type, data).then(resolve).catch(reject);
        return;
      }

      const taskId = `task-${++this.taskIdCounter}`;
      const task: WorkerTask = {
        id: taskId,
        type,
        data,
        resolve,
        reject,
        timeout: timeout || this.config.taskTimeout,
      };

      this.taskQueue.push(task);
      this.processNextTask();
    });
  }

  /**
   * 处理下一个任务
   */
  private processNextTask(): void {
    if (this.taskQueue.length === 0 || this.availableWorkers.length === 0) {
      return;
    }

    const task = this.taskQueue.shift()!;
    const worker = this.availableWorkers.shift()!;

    // 设置超时
    const timeoutId = setTimeout(() => {
      if (this.activeTasks.has(task.id)) {
        task.reject(new Error('Task timeout'));
        this.activeTasks.delete(task.id);
        this.workerTaskMap.delete(worker);
        this.availableWorkers.push(worker);
        this.processNextTask();
      }
    }, task.timeout!);

    // 记录活动任务
    this.activeTasks.set(task.id, task);
    this.workerTaskMap.set(worker, task.id);

    // 发送消息给 Worker
    const message: WorkerMessage = {
      id: task.id,
      type: task.type,
      data: task.data,
    };

    worker.postMessage(message);

    // 任务完成后清除超时
    const originalResolve = task.resolve;
    const originalReject = task.reject;

    task.resolve = (result) => {
      clearTimeout(timeoutId);
      originalResolve(result);
    };

    task.reject = (error) => {
      clearTimeout(timeoutId);
      originalReject(error);
    };
  }

  /**
   * 在主线程执行任务（降级方案）
   */
  private async executeInMainThread(type: string, data: any): Promise<any> {
    // 这里应该导入主线程版本的处理函数
    // 为了避免循环依赖，这里返回简化的结果
    console.warn(`Worker not available, executing ${type} in main thread`);

    switch (type) {
      case 'process-events':
        // 简化处理，直接返回事件
        return data.events;
      case 'expand-recurrence':
        // 简化处理，返回单个事件
        return [data.event];
      case 'detect-conflicts':
        // 简化处理，不检测冲突
        return data.events.map((e: any) => ({ ...e, conflicts: [] }));
      case 'calculate-positions':
        // 简化处理，不计算位置
        return data.events;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  /**
   * 处理事件列表
   */
  public async processEvents(
    events: CalendarEvent[],
    dateRange: { start: Date; end: Date },
    options: {
      expandRecurrence?: boolean;
      detectConflicts?: boolean;
      calculatePositions?: boolean;
      viewType?: 'day' | 'week';
    } = {}
  ): Promise<ProcessedEvent[]> {
    return this.executeTask<ProcessedEvent[]>('process-events', {
      events,
      dateRange: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
      options,
    });
  }

  /**
   * 展开重复规则
   */
  public async expandRecurrence(
    event: CalendarEvent,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    return this.executeTask<CalendarEvent[]>('expand-recurrence', {
      event,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }

  /**
   * 检测事件冲突
   */
  public async detectConflicts(events: ProcessedEvent[]): Promise<ProcessedEvent[]> {
    return this.executeTask<ProcessedEvent[]>('detect-conflicts', {
      events,
    });
  }

  /**
   * 计算事件位置
   */
  public async calculatePositions(
    events: ProcessedEvent[],
    viewType: 'day' | 'week'
  ): Promise<ProcessedEvent[]> {
    return this.executeTask<ProcessedEvent[]>('calculate-positions', {
      events,
      viewType,
    });
  }

  /**
   * 获取 Worker 池状态
   */
  public getPoolStatus(): {
    totalWorkers: number;
    availableWorkers: number;
    activeTasks: number;
    queuedTasks: number;
    enabled: boolean;
  } {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length,
      enabled: this.config.enabled,
    };
  }

  /**
   * 清空任务队列
   */
  public clearQueue(): void {
    this.taskQueue.forEach(task => {
      task.reject(new Error('Task cancelled'));
    });
    this.taskQueue = [];
  }

  /**
   * 终止所有 Worker
   */
  public terminate(): void {
    this.isTerminated = true;
    this.clearQueue();

    // 取消所有活动任务
    this.activeTasks.forEach(task => {
      task.reject(new Error('Worker manager terminated'));
    });
    this.activeTasks.clear();

    // 终止所有 Worker
    this.workers.forEach(worker => {
      worker.terminate();
    });

    this.workers = [];
    this.availableWorkers = [];
    this.workerTaskMap.clear();
  }
}

/**
 * 创建 Worker 管理器的单例实例
 */
let workerManagerInstance: WorkerManager | null = null;

export function getWorkerManager(config?: WorkerPoolConfig): WorkerManager {
  if (!workerManagerInstance) {
    workerManagerInstance = new WorkerManager(config);
  }
  return workerManagerInstance;
}

export function resetWorkerManager(): void {
  if (workerManagerInstance) {
    workerManagerInstance.terminate();
    workerManagerInstance = null;
  }
}

