# 阶段2：Core包重构和优化 - 详细实施指南

## 📋 总览

本阶段将完成Core包的全面重构和优化，包括：
1. 从src迁移核心模块到packages/core（增量迁移，保持现有功能）
2. 配置@ldesign/builder构建系统
3. 配置@antfu/eslint代码规范
4. 性能优化（对象池、批处理等）
5. 完善类型定义
6. 实现新功能（撤销/重做、键盘快捷键等）

---

## 🎯 实施策略

### 渐进式迁移
- ✅ 保留现有src目录作为参考
- ✅ 在packages/core中逐步完善功能
- ✅ 确保每一步都能构建成功
- ✅ 避免破坏性变更

### 质量保证
- 每个模块迁移后立即进行类型检查
- 每个模块迁移后立即进行ESLint检查
- 每个模块迁移后编写单元测试
- 每个模块迁移后验证构建

---

## 📁 迁移清单

### 第1步：配置基础设施

#### 1.1 Workspace配置
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'docs'
```

#### 1.2 Root package.json
```json
{
  "name": "@ldesign/calendar-workspace",
  "private": true,
  "scripts": {
    "build": "pnpm -r --filter=./packages/* run build",
    "dev": "pnpm -r --filter=./packages/* run dev",
    "lint": "pnpm -r --filter=./packages/* run lint",
    "test": "pnpm -r --filter=./packages/* run test",
    "type-check": "pnpm -r --filter=./packages/* run type-check"
  },
  "devDependencies": {
    "@antfu/eslint-config": "^2.6.0",
    "@ldesign/builder": "workspace:*",
    "@types/node": "^20.0.0",
    "eslint": "^8.56.0",
    "typescript": "^5.7.3",
    "vitest": "^1.0.0",
    "playwright": "^1.40.0"
  }
}
```

#### 1.3 Core包配置更新
```json
{
  "name": "@ldesign/calendar-core",
  "version": "1.0.0",
  "description": "日历核心功能 - 纯JavaScript/TypeScript实现，框架无关",
  "keywords": [
    "calendar",
    "scheduler",
    "events",
    "date",
    "recurrence",
    "framework-agnostic"
  ],
  "author": "LDesign Team",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./calendar": {
      "types": "./dist/calendar.d.ts",
      "import": "./dist/calendar.js",
      "require": "./dist/calendar.cjs"
    },
    "./types": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/types/index.js",
      "require": "./dist/types/index.cjs"
    },
    "./utils/*": {
      "types": "./dist/utils/*.d.ts",
      "import": "./dist/utils/*.js",
      "require": "./dist/utils/*.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "ldesign-builder build",
    "dev": "ldesign-builder build --watch",
    "clean": "ldesign-builder clean",
    "lint": "eslint src --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "@antfu/eslint-config": "^2.6.0",
    "@ldesign/builder": "workspace:*",
    "@types/node": "^20.0.0",
    "eslint": "^8.56.0",
    "typescript": "^5.7.3",
    "vitest": "^1.0.0"
  }
}
```

#### 1.4 @ldesign/builder配置
```typescript
// packages/core/ldesign.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    esm: {
      dir: 'dist',
      preserveStructure: true,
      dts: true
    },
    cjs: {
      dir: 'dist',
      preserveStructure: true,
      dts: false
    }
  },
  external: [],
  formats: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  minify: false,
  clean: true
})
```

#### 1.5 ESLint配置
```javascript
// packages/core/eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: false,
  react: false,
  rules: {
    'no-console': 'warn',
    'no-debugger': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }]
  }
})
```

#### 1.6 TypeScript配置
```json
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 第2步：类型系统完善

#### 2.1 核心类型定义
迁移并完善 `src/types/index.ts` → `packages/core/src/types/index.ts`

关键改进：
- ✅ 消除所有any类型
- ✅ 使用泛型支持自定义事件属性
- ✅ 严格的联合类型而非字符串
- ✅ 完整的JSDoc注释

```typescript
// packages/core/src/types/index.ts
/**
 * 日历视图类型
 */
export type CalendarView = 'month' | 'week' | 'day' | 'agenda' | 'list'

/**
 * 日历事件泛型类型
 * @template T - 自定义扩展属性类型
 */
export interface CalendarEvent<T extends Record<string, unknown> = Record<string, unknown>> {
  /** 事件唯一标识 */
  id: string
  /** 事件标题 */
  title: string
  /** 开始时间 */
  start: Date | string
  /** 结束时间 */
  end?: Date | string
  /** 是否全天事件 */
  allDay?: boolean
  
  // 重复规则
  recurrence?: RecurrenceRule
  recurrenceId?: string
  recurrenceException?: Date[]
  
  // 显示样式
  color?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  classNames?: string[]
  
  // 交互配置
  editable?: boolean
  startEditable?: boolean
  durationEditable?: boolean
  overlap?: boolean
  
  // 扩展属性
  description?: string
  location?: string
  url?: string
  extendedProps?: T
  
  // 渲染配置
  display?: 'auto' | 'block' | 'list-item' | 'background' | 'inverse-background' | 'none'
  
  // 源信息
  source?: string
}

/**
 * 重复规则类型
 */
export interface RecurrenceRule {
  /** 重复频率 */
  freq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  /** 间隔 */
  interval?: number
  /** 重复次数 */
  count?: number
  /** 结束日期 */
  until?: Date | string
  /** 星期几 (0-6, 0=周日) */
  byweekday?: number[]
  /** 月份中的第几天 */
  bymonthday?: number[]
  /** 月份 (1-12) */
  bymonth?: number[]
}

// ... 更多类型定义
```

### 第3步：核心模块迁移

#### 3.1 事件发射器优化
`src/utils/event-emitter.ts` → `packages/core/src/utils/event-emitter.ts`

改进点：
- ✅ 类型安全的事件系统
- ✅ 支持异步事件处理
- ✅ 自动清理内存泄漏
- ✅ 事件优先级支持

#### 3.2 日历核心类
`src/core/calendar.ts` → `packages/core/src/calendar.ts`

改进点：
- ✅ 完整的泛型支持
- ✅ 命令模式支持撤销/重做
- ✅ 事件批处理优化
- ✅ 完善的错误处理

#### 3.3 事件管理器
`src/core/event-manager.ts` → `packages/core/src/event-manager.ts`

改进点：
- ✅ 对象池减少GC压力
- ✅ 批量操作优化
- ✅ 索引优化快速查询

#### 3.4 其他核心模块
按优先级迁移：
1. ViewManager（视图管理器）
2. RecurrenceEngine（重复引擎）
3. TimezoneManager（时区管理）
4. CacheManager（缓存管理）
5. VirtualScroll（虚拟滚动）
6. WorkerManager（Worker管理）
7. Renderers（渲染器）
8. Interaction（交互处理）
9. Storage（存储适配器）
10. Plugins（插件系统）

### 第4步：新功能实现

#### 4.1 撤销/重做系统
```typescript
// packages/core/src/undo-redo/command.ts
export interface Command {
  execute(): void
  undo(): void
  redo(): void
}

// packages/core/src/undo-redo/history-manager.ts
export class HistoryManager {
  private undoStack: Command[] = []
  private redoStack: Command[] = []
  private maxSize = 50
  
  execute(command: Command): void
  undo(): void
  redo(): void
  canUndo(): boolean
  canRedo(): boolean
  clear(): void
}
```

#### 4.2 键盘快捷键系统
```typescript
// packages/core/src/keyboard/shortcut-manager.ts
export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
  description?: string
}

export class ShortcutManager {
  private shortcuts: Map<string, Shortcut> = new Map()
  
  register(shortcut: Shortcut): () => void
  unregister(key: string): void
  trigger(event: KeyboardEvent): boolean
  getAll(): Shortcut[]
}
```

#### 4.3 对象池
```typescript
// packages/core/src/performance/object-pool.ts
export class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset: (obj: T) => void
  private maxSize: number
  
  constructor(factory: () => T, reset: (obj: T) => void, maxSize = 100)
  
  acquire(): T
  release(obj: T): void
  clear(): void
  get size(): number
}
```

#### 4.4 事件批处理
```typescript
// packages/core/src/performance/batch-processor.ts
export class BatchProcessor<T> {
  private queue: T[] = []
  private processor: (items: T[]) => void
  private delay: number
  private timer: number | null = null
  
  constructor(processor: (items: T[]) => void, delay = 16)
  
  add(item: T): void
  addBatch(items: T[]): void
  flush(): void
  clear(): void
}
```

### 第5步：性能优化

#### 5.1 虚拟滚动增强
- 优化可视区域计算
- 支持动态高度
- 预渲染缓冲区

#### 5.2 Worker优化
- Worker池大小动态调整
- 任务优先级队列
- 超时和重试机制

#### 5.3 缓存策略
- LRU缓存自动淘汰
- 缓存预热机制
- 缓存失效策略

### 第6步：测试

#### 6.1 单元测试
```typescript
// packages/core/__tests__/calendar.test.ts
import { describe, it, expect } from 'vitest'
import { Calendar } from '../src/calendar'

describe('Calendar', () => {
  it('should create calendar instance', () => {
    const calendar = new Calendar()
    expect(calendar).toBeDefined()
  })
  
  it('should add event', async () => {
    const calendar = new Calendar()
    const event = await calendar.addEvent({
      id: '1',
      title: 'Test Event',
      start: new Date()
    })
    expect(event.id).toBe('1')
  })
  
  // 更多测试...
})
```

#### 6.2 性能测试
```typescript
// packages/core/__tests__/performance.test.ts
import { describe, it, expect } from 'vitest'
import { Calendar } from '../src/calendar'

describe('Performance', () => {
  it('should render 1000 events < 200ms', async () => {
    const calendar = new Calendar()
    const events = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      title: `Event ${i}`,
      start: new Date()
    }))
    
    const start = performance.now()
    await calendar.batchAddEvents(events)
    const duration = performance.now() - start
    
    expect(duration).toBeLessThan(200)
  })
})
```

---

## ✅ 验证清单

### 构建验证
- [ ] `pnpm build` 成功，无错误无警告
- [ ] 生成的类型定义完整
- [ ] Tree-shaking正常工作

### 代码质量验证
- [ ] `pnpm lint` 通过，0错误0警告
- [ ] `pnpm type-check` 通过，无类型错误
- [ ] 无any类型（除非明确需要）

### 测试验证
- [ ] 所有单元测试通过
- [ ] 测试覆盖率 > 90%
- [ ] 性能测试达标

### 功能验证
- [ ] 所有现有功能正常工作
- [ ] 新功能（撤销/重做、快捷键）工作正常
- [ ] 性能优化有效（对象池、批处理）

---

## 📊 预期成果

### 代码质量
- ✅ TypeScript严格模式
- ✅ ESLint零错误零警告
- ✅ 90%+测试覆盖率

### 性能指标
- ✅ 1000事件渲染 < 200ms
- ✅ 内存占用 < 50MB
- ✅ 打包体积 < 50KB (gzip)

### 可维护性
- ✅ 清晰的模块划分
- ✅ 完整的类型定义
- ✅ 详细的文档注释

---

**下一阶段**：阶段3 - Vue适配器开发
