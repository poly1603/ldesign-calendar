/**
 * BatchProcessor 单元测试
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BatchProcessor, createBatchProcessor } from '../../src/performance/batch-processor'

describe('batchProcessor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  describe('基础功能', () => {
    it('应该创建批处理器实例', () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor)

      expect(batchProcessor).toBeDefined()
      expect(batchProcessor.size).toBe(0)
    })

    it('应该使用便捷函数创建批处理器', () => {
      const processor = vi.fn()
      const batchProcessor = createBatchProcessor(processor)

      expect(batchProcessor).toBeInstanceOf(BatchProcessor)
    })
  })

  describe('添加项', () => {
    it('应该能够添加单个项', () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor)

      batchProcessor.add('item1')

      expect(batchProcessor.size).toBe(1)
    })

    it('应该能够批量添加项', () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor)

      batchProcessor.addBatch(['item1', 'item2', 'item3'])

      expect(batchProcessor.size).toBe(3)
    })
  })

  describe('延迟刷新', () => {
    it('应该在延迟后自动刷新', async () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor, { delay: 100 })

      batchProcessor.add('item1')
      batchProcessor.add('item2')

      expect(processor).not.toHaveBeenCalled()

      // 快进时间
      await vi.advanceTimersByTimeAsync(100)

      expect(processor).toHaveBeenCalledOnce()
      expect(processor).toHaveBeenCalledWith(['item1', 'item2'])
      expect(batchProcessor.size).toBe(0)
    })

    it('应该使用默认延迟16ms', async () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor)

      batchProcessor.add('item1')

      await vi.advanceTimersByTimeAsync(16)

      expect(processor).toHaveBeenCalledOnce()
    })
  })

  describe('立即刷新', () => {
    it('应该能够立即刷新队列', () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor)

      batchProcessor.add('item1')
      batchProcessor.add('item2')

      batchProcessor.flush()

      expect(processor).toHaveBeenCalledOnce()
      expect(processor).toHaveBeenCalledWith(['item1', 'item2'])
      expect(batchProcessor.size).toBe(0)
    })

    it('刷新空队列应该不调用处理器', () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor)

      batchProcessor.flush()

      expect(processor).not.toHaveBeenCalled()
    })
  })

  describe('最大批次大小', () => {
    it('达到最大批次大小时应该立即刷新', () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor, { maxBatchSize: 3 })

      batchProcessor.add('item1')
      batchProcessor.add('item2')
      expect(processor).not.toHaveBeenCalled()

      batchProcessor.add('item3')

      expect(processor).toHaveBeenCalledOnce()
      expect(processor).toHaveBeenCalledWith(['item1', 'item2', 'item3'])
    })

    it('批量添加超过最大批次大小应该立即刷新', () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor, { maxBatchSize: 5 })

      batchProcessor.addBatch(['item1', 'item2', 'item3', 'item4', 'item5', 'item6'])

      expect(processor).toHaveBeenCalledOnce()
    })
  })

  describe('异步处理', () => {
    it('应该支持异步处理器', async () => {
      const processor = vi.fn(async (items: string[]) => {
        await Promise.resolve()
      })
      const batchProcessor = new BatchProcessor(processor)

      batchProcessor.add('item1')
      batchProcessor.flush()

      expect(batchProcessor.isProcessing).toBe(true)

      // 等待异步处理完成
      await vi.runAllTimersAsync()

      expect(batchProcessor.isProcessing).toBe(false)
    })

    it('处理期间添加的项应该在下次批处理', async () => {
      let resolveProcessor: () => void
      const processorPromise = new Promise<void>((resolve) => {
        resolveProcessor = resolve
      })

      const processor = vi.fn(async () => {
        await processorPromise
      })

      const batchProcessor = new BatchProcessor(processor, { delay: 10 })

      batchProcessor.add('item1')
      batchProcessor.flush()

      // 处理期间添加新项
      batchProcessor.add('item2')

      expect(batchProcessor.size).toBe(1)

      // 完成第一次处理
      resolveProcessor!()
      await vi.runAllTimersAsync()

      // 应该有第二次处理
      await vi.advanceTimersByTimeAsync(10)

      expect(processor).toHaveBeenCalledTimes(2)
    })
  })

  describe('清空操作', () => {
    it('应该能够清空队列', () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor)

      batchProcessor.add('item1')
      batchProcessor.add('item2')

      batchProcessor.clear()

      expect(batchProcessor.size).toBe(0)

      batchProcessor.flush()
      expect(processor).not.toHaveBeenCalled()
    })
  })

  describe('销毁', () => {
    it('应该能够销毁批处理器', () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor)

      batchProcessor.add('item1')
      batchProcessor.destroy()

      expect(batchProcessor.size).toBe(0)

      batchProcessor.add('item2')
      batchProcessor.flush()

      expect(processor).not.toHaveBeenCalled()
    })
  })

  describe('状态检查', () => {
    it('应该正确报告队列大小', () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor)

      expect(batchProcessor.size).toBe(0)

      batchProcessor.add('item1')
      expect(batchProcessor.size).toBe(1)

      batchProcessor.add('item2')
      expect(batchProcessor.size).toBe(2)

      batchProcessor.flush()
      expect(batchProcessor.size).toBe(0)
    })

    it('应该正确报告处理状态', async () => {
      const processor = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      const batchProcessor = new BatchProcessor(processor)

      expect(batchProcessor.isProcessing).toBe(false)

      batchProcessor.add('item1')
      batchProcessor.flush()

      expect(batchProcessor.isProcessing).toBe(true)

      await vi.runAllTimersAsync()

      expect(batchProcessor.isProcessing).toBe(false)
    })
  })
})
