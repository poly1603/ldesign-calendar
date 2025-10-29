/**
 * ObjectPool 单元测试
 */

import { describe, expect, it } from 'vitest'

import { createObjectPool, ObjectPool } from '../../src/performance/object-pool'

interface TestObject {
  id: number
  data: string
}

describe('objectPool', () => {
  describe('基础功能', () => {
    it('应该创建对象池实例', () => {
      const factory = (): TestObject => ({ id: 0, data: '' })
      const reset = (obj: TestObject): void => {
        obj.id = 0
        obj.data = ''
      }

      const pool = new ObjectPool(factory, reset)

      expect(pool).toBeDefined()
      expect(pool.size).toBeGreaterThan(0) // 默认预热10个对象
    })

    it('应该使用便捷函数创建对象池', () => {
      const factory = (): TestObject => ({ id: 0, data: '' })
      const reset = (obj: TestObject): void => {
        obj.id = 0
        obj.data = ''
      }

      const pool = createObjectPool(factory, reset)

      expect(pool).toBeInstanceOf(ObjectPool)
    })
  })

  describe('对象获取和释放', () => {
    it('应该能够获取对象', () => {
      const factory = (): TestObject => ({ id: 0, data: '' })
      const reset = (obj: TestObject): void => {
        obj.id = 0
        obj.data = ''
      }

      const pool = new ObjectPool(factory, reset)
      const obj = pool.acquire()

      expect(obj).toBeDefined()
      expect(obj.id).toBe(0)
      expect(obj.data).toBe('')
    })

    it('应该能够释放对象回池', () => {
      const factory = (): TestObject => ({ id: 0, data: '' })
      const reset = (obj: TestObject): void => {
        obj.id = 0
        obj.data = ''
      }

      const pool = new ObjectPool(factory, reset)
      const initialSize = pool.size

      const obj = pool.acquire()
      expect(pool.size).toBe(initialSize - 1)

      obj.id = 123
      obj.data = 'test'

      pool.release(obj)
      expect(pool.size).toBe(initialSize)

      // 验证对象已被重置
      const obj2 = pool.acquire()
      expect(obj2.id).toBe(0)
      expect(obj2.data).toBe('')
    })

    it('应该能够批量释放对象', () => {
      const factory = (): TestObject => ({ id: 0, data: '' })
      const reset = (obj: TestObject): void => {
        obj.id = 0
        obj.data = ''
      }

      const pool = new ObjectPool(factory, reset)
      const objects = [pool.acquire(), pool.acquire(), pool.acquire()]

      pool.releaseAll(objects)

      expect(pool.size).toBeGreaterThanOrEqual(3)
    })
  })

  describe('预热机制', () => {
    it('应该预热指定数量的对象', () => {
      const factory = (): TestObject => ({ id: 0, data: '' })
      const reset = (obj: TestObject): void => {
        obj.id = 0
        obj.data = ''
      }

      const pool = new ObjectPool(factory, reset, {
        initialSize: 20,
        prewarm: true,
      })

      expect(pool.size).toBe(20)
    })

    it('应该支持禁用预热', () => {
      const factory = (): TestObject => ({ id: 0, data: '' })
      const reset = (obj: TestObject): void => {
        obj.id = 0
        obj.data = ''
      }

      const pool = new ObjectPool(factory, reset, {
        initialSize: 20,
        prewarm: false,
      })

      expect(pool.size).toBe(0)
    })
  })

  describe('容量限制', () => {
    it('应该尊重最大容量限制', () => {
      const factory = (): TestObject => ({ id: 0, data: '' })
      const reset = (obj: TestObject): void => {
        obj.id = 0
        obj.data = ''
      }

      const pool = new ObjectPool(factory, reset, {
        initialSize: 5,
        maxSize: 10,
      })

      // 获取并释放超过最大容量的对象
      const objects = Array.from({ length: 15 }, () => pool.acquire())
      objects.forEach(obj => pool.release(obj))

      // 池大小不应超过maxSize
      expect(pool.size).toBeLessThanOrEqual(10)
    })
  })

  describe('使用率监控', () => {
    it('应该正确跟踪使用中的对象数量', () => {
      const factory = (): TestObject => ({ id: 0, data: '' })
      const reset = (obj: TestObject): void => {
        obj.id = 0
        obj.data = ''
      }

      const pool = new ObjectPool(factory, reset, { initialSize: 10 })

      expect(pool.inUse).toBe(0)

      const obj1 = pool.acquire()
      expect(pool.inUse).toBe(1)

      const obj2 = pool.acquire()
      expect(pool.inUse).toBe(2)

      pool.release(obj1)
      expect(pool.inUse).toBe(1)

      pool.release(obj2)
      expect(pool.inUse).toBe(0)
    })

    it('应该计算正确的使用率', () => {
      const factory = (): TestObject => ({ id: 0, data: '' })
      const reset = (obj: TestObject): void => {
        obj.id = 0
        obj.data = ''
      }

      const pool = new ObjectPool(factory, reset, { initialSize: 10 })

      const obj1 = pool.acquire()
      const obj2 = pool.acquire()

      // 2个使用中，8个空闲，使用率应该是 2/10 = 0.2
      expect(pool.utilizationRate).toBeCloseTo(0.2, 1)

      pool.release(obj1)
      pool.release(obj2)
    })
  })

  describe('清空操作', () => {
    it('应该能够清空池', () => {
      const factory = (): TestObject => ({ id: 0, data: '' })
      const reset = (obj: TestObject): void => {
        obj.id = 0
        obj.data = ''
      }

      const pool = new ObjectPool(factory, reset, { initialSize: 10 })

      pool.clear()

      expect(pool.size).toBe(0)
      expect(pool.inUse).toBe(0)
    })
  })

  describe('属性访问', () => {
    it('应该返回正确的容量', () => {
      const factory = (): TestObject => ({ id: 0, data: '' })
      const reset = (obj: TestObject): void => {
        obj.id = 0
        obj.data = ''
      }

      const pool = new ObjectPool(factory, reset, { maxSize: 50 })

      expect(pool.capacity).toBe(50)
    })
  })
})
