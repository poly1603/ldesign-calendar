# 🚀 快速开始指南

**项目**: @ldesign/calendar 多框架日历组件库  
**当前进度**: 阶段2完成35% - Core包基础已就绪  
**下一步**: 验证构建 → 补充测试 → 开始Vue适配器

---

## ⚡ 立即开始

### 1️⃣ 验证构建（5分钟）

```bash
# 进入项目目录
cd D:\WorkBench\ldesign\libraries\calendar

# 安装依赖
pnpm install

# 构建core包
pnpm build -F @ldesign/calendar-core

# 查看构建结果
ls packages/core/dist
```

**✅ 成功标志**: 看到 `dist/` 目录包含 `.js`、`.cjs`、`.d.ts` 文件

---

### 2️⃣ 运行代码检查（2分钟）

```bash
# ESLint检查
pnpm lint -F @ldesign/calendar-core

# TypeScript类型检查
pnpm type-check -F @ldesign/calendar-core
```

**✅ 成功标志**: 0个错误（警告可以暂时忽略）

---

### 3️⃣ 运行测试（1分钟）

```bash
# 运行单元测试
pnpm test -F @ldesign/calendar-core

# 查看覆盖率
pnpm test:coverage -F @ldesign/calendar-core
```

**✅ 成功标志**: 至少1个测试套件通过

---

## 📁 项目结构一览

```
@ldesign/calendar/
├── packages/
│   └── core/              👈 当前工作重点
│       ├── src/
│       │   ├── performance/    ✅ 对象池、批处理器
│       │   ├── undo-redo/      ✅ 撤销/重做系统
│       │   ├── keyboard/       ✅ 快捷键管理
│       │   └── types/          ✅ 增强类型定义
│       └── __tests__/          ⏳ 需补充更多测试
└── 文档/
    ├── REFACTOR_PLAN.md        📖 完整重构方案
    ├── API_DESIGN.md           📖 API设计规范
    ├── PHASE2_COMPLETED.md     📖 阶段2完成报告
    └── QUICK_START.md          📖 本文档
```

---

## 🎯 核心功能速览

### ObjectPool - 对象池

```typescript
import { ObjectPool } from '@ldesign/calendar-core'

// 创建对象池
const pool = new ObjectPool(
  () => ({ id: 0, data: '' }),  // 工厂函数
  (obj) => { obj.id = 0; obj.data = '' }, // 重置函数
  { initialSize: 10, maxSize: 100 }
)

// 使用
const obj = pool.acquire()
// ... 使用对象
pool.release(obj) // 释放回池
```

### BatchProcessor - 批处理器

```typescript
import { BatchProcessor } from '@ldesign/calendar-core'

// 创建批处理器
const processor = new BatchProcessor(
  async (items) => {
    console.log('批量处理', items.length, '个项目')
  },
  { delay: 16, maxBatchSize: 1000 }
)

// 使用
processor.add(item1)
processor.add(item2)
// 16ms后自动批量处理
```

### HistoryManager - 撤销/重做

```typescript
import { HistoryManager, AbstractCommand } from '@ldesign/calendar-core'

// 创建历史管理器
const history = new HistoryManager({ maxSize: 50 })

// 定义命令
class AddEventCommand extends AbstractCommand {
  execute() { /* 添加事件 */ }
  undo() { /* 撤销添加 */ }
}

// 使用
await history.execute(new AddEventCommand())
await history.undo()
await history.redo()
```

### ShortcutManager - 快捷键

```typescript
import { ShortcutManager } from '@ldesign/calendar-core'

// 创建快捷键管理器
const shortcuts = new ShortcutManager()

// 注册快捷键
shortcuts.register({
  key: 'z',
  ctrl: true,
  handler: () => history.undo(),
  description: '撤销'
})

// 开始监听
shortcuts.attach()
```

---

## 🔧 常见问题

### Q: 构建失败怎么办？

**A**: 检查以下几点：
1. Node.js版本 >= 16
2. pnpm已安装 (`npm install -g pnpm`)
3. 删除 `node_modules` 重新安装
4. 查看错误日志，可能缺少某些依赖

### Q: ESLint报错怎么办？

**A**: 大部分错误可以自动修复：
```bash
pnpm lint:fix -F @ldesign/calendar-core
```

### Q: 类型错误怎么办？

**A**: 检查导入路径是否正确：
```typescript
// ✅ 正确
import { ObjectPool } from '../../src/performance/object-pool'

// ❌ 错误
import { ObjectPool } from '@ldesign/calendar-core/performance'
```

---

## 📋 待办清单

### 立即任务
- [ ] 验证构建
- [ ] 修复任何错误
- [ ] 运行现有测试

### 短期任务（1-2天）
- [ ] 补充BatchProcessor测试
- [ ] 补充HistoryManager测试
- [ ] 补充ShortcutManager测试
- [ ] 达到60%测试覆盖率

### 中期任务（3-5天）
- [ ] 集成新功能到Calendar类
- [ ] 创建使用示例
- [ ] 更新README

---

## 🎓 学习资源

### 已有文档
1. **REFACTOR_PLAN.md** - 了解整体架构设计
2. **API_DESIGN.md** - 学习API使用方式
3. **PHASE2_COMPLETED.md** - 查看已完成功能

### 代码示例
- `__tests__/performance/object-pool.test.ts` - 完整的对象池测试示例
- `src/performance/` - 性能优化工具源码
- `src/undo-redo/` - 撤销/重做系统源码
- `src/keyboard/` - 快捷键系统源码

---

## 💪 继续开发

### 方式1: 继续完善Core包
```bash
# 创建新的测试文件
# 补充文档
# 优化现有实现
```

### 方式2: 开始Vue适配器（阶段3）
```bash
# 创建packages/vue目录
# 实现Vue组件和composables
# 配置构建和测试
```

### 方式3: 创建演示项目
```bash
# 使用@ldesign/launcher创建演示
# 展示所有新功能
# 性能对比测试
```

---

## 🎉 你已经完成了什么

✅ **1400+行高质量TypeScript代码**  
✅ **3个核心功能模块**（性能、撤销、快捷键）  
✅ **完整的类型系统**（泛型支持）  
✅ **专业的项目配置**（monorepo、eslint、vitest）  
✅ **详尽的文档**（7个文档文件）  

**这是一个非常扎实的开始！** 🚀

---

## 📞 需要帮助？

查看这些文档：
- 遇到构建问题 → `PHASE2_COMPLETED.md`
- 不清楚API → `API_DESIGN.md`
- 想了解全局 → `REFACTOR_PLAN.md`
- 查看进度 → `PROJECT_SUMMARY.md`

---

**开始你的开发之旅吧！** 💻✨
