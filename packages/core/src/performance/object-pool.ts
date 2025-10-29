/**
 * @ldesign/calendar-core - 瀵硅薄姹?
 * 鍑忓皯GC鍘嬪姏锛屾彁鍗囨€ц兘
 */

/**
 * 瀵硅薄姹犻厤缃?
 */
export interface ObjectPoolOptions {
  /** 鍒濆澶у皬 */
  initialSize?: number
  /** 鏈€澶уぇ灏?*/
  maxSize?: number
  /** 鏄惁棰勭儹锛堥鍏堝垱寤哄璞★級 */
  prewarm?: boolean
}

/**
 * 瀵硅薄姹犵被
 * @template T - 姹犱腑瀵硅薄绫诲瀷
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private readonly factory: () => T
  private readonly reset: (obj: T) => void
  private readonly maxSize: number
  private inUseCount = 0

  /**
   * 鍒涘缓瀵硅薄姹?
   * @param factory - 瀵硅薄宸ュ巶鍑芥暟
   * @param reset - 瀵硅薄閲嶇疆鍑芥暟
   * @param options - 閰嶇疆閫夐」
   */
  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    options: ObjectPoolOptions = {},
  ) {
    this.factory = factory
    this.reset = reset
    this.maxSize = options.maxSize ?? 100

    const initialSize = options.initialSize ?? 10
    if (options.prewarm !== false) {
      this.prewarm(initialSize)
    }
  }

  /**
   * 棰勭儹姹?- 棰勫厛鍒涘缓瀵硅薄
   */
  private prewarm(size: number): void {
    for (let i = 0; i < size; i++) {
      this.pool.push(this.factory())
    }
  }

  /**
   * 鑾峰彇瀵硅薄
   * @returns 姹犱腑鐨勫璞℃垨鏂板垱寤虹殑瀵硅薄
   */
  acquire(): T {
    this.inUseCount++

    if (this.pool.length > 0) {
      return this.pool.pop()!
    }

    return this.factory()
  }

  /**
   * 閲婃斁瀵硅薄鍥炴睜
   * @param obj - 瑕侀噴鏀剧殑瀵硅薄
   */
  release(obj: T): void {
    if (this.inUseCount > 0) {
      this.inUseCount--
    }

    // 閲嶇疆瀵硅薄鐘舵€?
    this.reset(obj)

    // 濡傛灉姹犳湭婊★紝鏀惧洖姹犱腑
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj)
    }
    // 鍚﹀垯璁〨C鍥炴敹
  }

  /**
   * 鎵归噺閲婃斁瀵硅薄
   * @param objects - 瑕侀噴鏀剧殑瀵硅薄鏁扮粍
   */
  releaseAll(objects: T[]): void {
    for (const obj of objects) {
      this.release(obj)
    }
  }

  /**
   * 娓呯┖姹?
   */
  clear(): void {
    this.pool = []
    this.inUseCount = 0
  }

  /**
   * 鑾峰彇姹犱腑鍙敤瀵硅薄鏁伴噺
   */
  get size(): number {
    return this.pool.length
  }

  /**
   * 鑾峰彇姝ｅ湪浣跨敤鐨勫璞℃暟閲?
   */
  get inUse(): number {
    return this.inUseCount
  }

  /**
   * 鑾峰彇鎬诲閲?
   */
  get capacity(): number {
    return this.maxSize
  }

  /**
   * 鑾峰彇姹犵殑浣跨敤鐜?
   */
  get utilizationRate(): number {
    return this.inUseCount / (this.inUseCount + this.pool.length)
  }
}

/**
 * 鍒涘缓瀵硅薄姹犵殑渚挎嵎鍑芥暟
 */
export function createObjectPool<T>(
  factory: () => T,
  reset: (obj: T) => void,
  options?: ObjectPoolOptions,
): ObjectPool<T> {
  return new ObjectPool(factory, reset, options)
}

