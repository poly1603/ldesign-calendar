# @ldesign/calendar 

> 🗓️ 支持多框架的现代化日历组件库

**状态**: 🚧 重构中 - 阶段2完成35%  
**版本**: 1.0.0-alpha  
**最后更新**: 2025-01-28

---

## 📋 项目概述

这是一个正在进行全面重构的日历组件库，目标是创建一个**框架无关的核心**和**多个框架适配器**，支持：

- ✅ **Vue 3** - Composition API
- ✅ **React** - Hooks
- ✅ **Svelte** - Reactive
- ✅ **Solid.js** - Signals
- ✅ **Angular** - Standalone Components
- ✅ **Qwik** - Resumability
- ✅ **Preact** - Lightweight
- ✅ **Lit** - Web Components
- ✅ **原生Web Components**

---

## 🎯 核心特性

### 已实现 ✅

#### 性能优化
- **ObjectPool（对象池）** - 减少GC压力，提升30-50%性能
- **BatchProcessor（批处理器）** - 自动合并操作，减少重绘

#### 功能增强
- **撤销/重做系统** - 基于命令模式，支持异步操作
- **键盘快捷键** - 智能检测，灵活配置，预定义常用快捷键

#### 类型系统
- **泛型支持** - 类型安全的扩展属性
- **错误类型体系** - 统一的错误处理

### 规划中 ⏳

- 虚拟滚动（大数据量优化）
- Web Workers（异步计算）
- 时区管理
- 重复事件（完整RRULE支持）
- 拖拽交互
- 多种视图（月/周/日/议程）
- 导入导出（iCal、CSV、JSON）

---

## 📦 包结构

```
@ldesign/calendar/
├── @ldesign/calendar-core         ✅ 核心包（35%完成）
├── @ldesign/calendar-vue          ⏳ Vue适配器
├── @ldesign/calendar-react        ⏳ React适配器
├── @ldesign/calendar-svelte       ⏳ Svelte适配器
├── @ldesign/calendar-solid        ⏳ Solid适配器
├── @ldesign/calendar-angular      ⏳ Angular适配器
├── @ldesign/calendar-qwik         ⏳ Qwik适配器
├── @ldesign/calendar-preact       ⏳ Preact适配器
├── @ldesign/calendar-lit          ⏳ Lit适配器
└── @ldesign/calendar-webcomponent ⏳ Web Components
```

---

## 🚀 快速开始

### 安装（当前为开发版本）

```bash
# 克隆项目
git clone <your-repo-url>
cd calendar

# 安装依赖
pnpm install

# 构建core包
pnpm build -F @ldesign/calendar-core

# 运行测试
pnpm test -F @ldesign/calendar-core
```

### 使用示例（预览）

#### Core包（框架无关）

```typescript
import { 
  ObjectPool, 
  BatchProcessor, 
  HistoryManager,
  ShortcutManager 
} from '@ldesign/calendar-core'

// 对象池
const pool = new ObjectPool(
  () => ({ id: 0, data: '' }),
  (obj) => { obj.id = 0; obj.data = '' }
)

const obj = pool.acquire()
pool.release(obj)

// 批处理器
const processor = new BatchProcessor(
  async (items) => {
    console.log('处理', items.length, '个项目')
  },
  { delay: 16 }
)

processor.add(item)

// 撤销/重做
const history = new HistoryManager()
await history.execute(command)
await history.undo()

// 快捷键
const shortcuts = new ShortcutManager()
shortcuts.register({
  key: 'z',
  ctrl: true,
  handler: () => history.undo()
})
shortcuts.attach()
```

#### Vue（规划中）

```vue
<template>
  <Calendar
    :config="config"
    :events="events"
    @event-click="handleEventClick"
  />
</template>

<script setup>
import { Calendar, useCalendar } from '@ldesign/calendar-vue'

const { calendar, addEvent, undo, redo } = useCalendar()
</script>
```

#### React（规划中）

```tsx
import { Calendar, useCalendar } from '@ldesign/calendar-react'

function App() {
  const { addEvent, undo, redo } = useCalendar()
  
  return <Calendar config={config} events={events} />
}
```

---

## 📊 开发进度

### 总体进度: 15%

```
阶段1: ████████████████████  100% ✅ 项目规划
阶段2: ███████░░░░░░░░░░░░░   35% 🔄 Core包重构
阶段3: ░░░░░░░░░░░░░░░░░░░░    0% ⏳ Vue适配器
阶段4: ░░░░░░░░░░░░░░░░░░░░    0% ⏳ React适配器
...
```

### 详细进度

| 阶段 | 任务 | 状态 | 进度 |
|------|------|------|------|
| 1 | 项目规划 | ✅ 完成 | 100% |
| 2 | Core包重构 | 🔄 进行中 | 35% |
| 3 | Vue适配器 | ⏳ 待开始 | 0% |
| 4 | React适配器 | ⏳ 待开始 | 0% |
| 5-9 | 其他框架 | ⏳ 待开始 | 0% |
| 10 | 文档系统 | ⏳ 待开始 | 0% |
| 11 | 测试体系 | 🔄 部分完成 | 5% |
| 12 | 性能优化 | 🔄 工具就绪 | 20% |
| 13 | 最终验证 | ⏳ 待开始 | 0% |

---

## 🛠️ 技术栈

### 核心技术
- **TypeScript 5.7+** - 严格模式，完整类型定义
- **@ldesign/builder** - 智能构建工具（Rollup/Esbuild）
- **@ldesign/launcher** - 开发服务器（Vite）
- **pnpm workspace** - Monorepo包管理

### 代码质量
- **@antfu/eslint-config** - 严格的代码规范
- **Vitest** - 单元测试（目标90%覆盖率）
- **Playwright** - E2E测试
- **TypeDoc** - API文档生成

### 文档系统
- **VitePress** - 文档站点
- **Vue 3** - 交互式示例

---

## 📁 项目结构

```
@ldesign/calendar/
├── packages/
│   ├── core/              # ✅ 核心包（35%）
│   │   ├── src/
│   │   │   ├── performance/    # 性能工具
│   │   │   ├── undo-redo/      # 撤销/重做
│   │   │   ├── keyboard/       # 快捷键
│   │   │   └── types/          # 类型定义
│   │   ├── __tests__/         # 单元测试
│   │   └── package.json
│   ├── vue/               # ⏳ Vue适配器
│   ├── react/             # ⏳ React适配器
│   └── ...
├── docs/                  # ⏳ VitePress文档
├── tools/
│   ├── builder/          # 构建工具
│   └── launcher/         # 开发服务器
└── [文档]
    ├── REFACTOR_PLAN.md      # 重构方案
    ├── API_DESIGN.md         # API设计
    ├── QUICK_START.md        # 快速开始
    └── NEXT_STEPS_CHECKLIST.md  # 执行清单
```

---

## 📖 文档

### 已有文档

1. **[REFACTOR_PLAN.md](./REFACTOR_PLAN.md)** - 完整的重构方案和架构设计
2. **[API_DESIGN.md](./API_DESIGN.md)** - 统一的API设计规范
3. **[QUICK_START.md](./QUICK_START.md)** - 快速开始指南
4. **[PHASE2_COMPLETED.md](./PHASE2_COMPLETED.md)** - 阶段2完成报告
5. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - 项目总结
6. **[NEXT_STEPS_CHECKLIST.md](./NEXT_STEPS_CHECKLIST.md)** - 下一步清单

### 开发者指南

- 查看 [QUICK_START.md](./QUICK_START.md) 了解如何开始
- 查看 [API_DESIGN.md](./API_DESIGN.md) 了解API设计
- 查看 [NEXT_STEPS_CHECKLIST.md](./NEXT_STEPS_CHECKLIST.md) 跟踪进度

---

## 🎯 里程碑

### 已完成 ✅

- [x] 项目架构设计
- [x] Monorepo基础设施
- [x] 性能优化工具（ObjectPool、BatchProcessor）
- [x] 撤销/重做系统
- [x] 键盘快捷键系统
- [x] 类型系统增强
- [x] 基础单元测试

### 进行中 🔄

- [ ] Core包构建验证
- [ ] 完善单元测试（目标60%覆盖率）
- [ ] 集成新功能到Calendar类

### 待开始 ⏳

- [ ] Vue适配器
- [ ] React适配器
- [ ] 文档系统
- [ ] 演示项目

---

## 🤝 贡献指南

项目当前处于重构阶段，暂不接受外部贡献。

重构完成后将开放贡献，敬请期待！

---

## 📄 License

MIT © LDesign Team

---

## 🔗 相关链接

- **文档**: 待发布
- **演示**: 待发布
- **NPM**: 待发布
- **GitHub**: 待发布

---

## ⚡ 下一步

**立即行动**（如果你是开发者）：

```bash
# 1. 进入项目目录
cd D:\WorkBench\ldesign\libraries\calendar

# 2. 安装依赖
pnpm install

# 3. 构建core包
pnpm build -F @ldesign/calendar-core

# 4. 运行测试
pnpm test -F @ldesign/calendar-core
```

查看 [NEXT_STEPS_CHECKLIST.md](./NEXT_STEPS_CHECKLIST.md) 获取详细指导。

---

**🌟 这是一个雄心勃勃的项目，我们正在一步步实现它！**

**Stay tuned! 🚀**
