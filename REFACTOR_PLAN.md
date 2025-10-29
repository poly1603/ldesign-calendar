# @ldesign/calendar 全面重构和优化方案

## 📋 项目概述

本方案旨在将现有的@ldesign/calendar项目重构为一个支持多框架的monorepo架构，实现框架无关的核心功能和多个框架适配器。

---

## 🎯 核心目标

1. **多框架支持**：Vue3、React、Angular、Solid.js、Svelte、Qwik、Preact、Lit、Web Components
2. **性能优化**：确保1000+事件流畅渲染，内存占用<50MB，无内存泄漏
3. **完整的类型支持**：TypeScript类型定义完整，无any类型
4. **代码质量**：所有包使用@antfu/eslint，0错误0警告
5. **完整的测试覆盖**：单元测试(>90%)、可视化测试、性能测试
6. **完善的文档**：VitePress文档系统，包括API文档、使用指南、示例

---

## 📁 新的项目结构

```
@ldesign/calendar/
├── packages/
│   ├── core/                    # 核心包（框架无关）
│   │   ├── src/
│   │   │   ├── calendar.ts     # 日历核心类
│   │   │   ├── event-manager.ts # 事件管理器
│   │   │   ├── view-manager.ts  # 视图管理器
│   │   │   ├── recurrence-engine.ts # 重复规则引擎
│   │   │   ├── timezone-manager.ts  # 时区管理器
│   │   │   ├── cache-manager.ts     # 缓存管理器
│   │   │   ├── virtual-scroll.ts    # 虚拟滚动
│   │   │   ├── worker-manager.ts    # Worker管理器
│   │   │   ├── print-manager.ts     # 打印管理器
│   │   │   ├── import-export.ts     # 导入导出
│   │   │   ├── reminder-engine.ts   # 提醒引擎
│   │   │   ├── renderers/          # 渲染器
│   │   │   ├── interaction/        # 交互处理
│   │   │   ├── storage/            # 存储适配器
│   │   │   ├── plugins/            # 插件系统
│   │   │   ├── utils/              # 工具函数
│   │   │   ├── types/              # 类型定义
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── ldesign.config.ts       # @ldesign/builder配置
│   │   ├── eslint.config.js        # @antfu/eslint配置
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── vue/                     # Vue3适配器
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Calendar.vue
│   │   │   │   ├── MonthView.vue
│   │   │   │   ├── WeekView.vue
│   │   │   │   ├── DayView.vue
│   │   │   │   └── AgendaView.vue
│   │   │   ├── composables/
│   │   │   │   ├── useCalendar.ts
│   │   │   │   ├── useEvents.ts
│   │   │   │   ├── useViews.ts
│   │   │   │   └── useRecurrence.ts
│   │   │   └── index.ts
│   │   ├── examples/            # 演示项目（@ldesign/launcher）
│   │   ├── __tests__/          # 测试文件
│   │   ├── package.json
│   │   ├── ldesign.config.ts
│   │   ├── eslint.config.js
│   │   └── README.md
│   │
│   ├── react/                   # React适配器
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Calendar.tsx
│   │   │   │   ├── MonthView.tsx
│   │   │   │   ├── WeekView.tsx
│   │   │   │   ├── DayView.tsx
│   │   │   │   └── AgendaView.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCalendar.ts
│   │   │   │   ├── useEvents.ts
│   │   │   │   ├── useViews.ts
│   │   │   │   └── useRecurrence.ts
│   │   │   └── index.ts
│   │   ├── examples/
│   │   ├── __tests__/
│   │   ├── package.json
│   │   ├── ldesign.config.ts
│   │   ├── eslint.config.js
│   │   └── README.md
│   │
│   ├── svelte/                  # Svelte适配器
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Calendar.svelte
│   │   │   │   └── ...
│   │   │   ├── stores/
│   │   │   └── index.ts
│   │   ├── examples/
│   │   ├── __tests__/
│   │   ├── package.json
│   │   ├── ldesign.config.ts
│   │   ├── eslint.config.js
│   │   └── README.md
│   │
│   ├── solid/                   # Solid.js适配器
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── primitives/
│   │   │   └── index.ts
│   │   ├── examples/
│   │   ├── __tests__/
│   │   └── ...
│   │
│   ├── angular/                 # Angular适配器
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── directives/
│   │   │   └── index.ts
│   │   ├── examples/
│   │   ├── __tests__/
│   │   └── ...
│   │
│   ├── qwik/                    # Qwik适配器
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── index.ts
│   │   ├── examples/
│   │   ├── __tests__/
│   │   └── ...
│   │
│   ├── preact/                  # Preact适配器
│   │   ├── src/
│   │   ├── examples/
│   │   └── ...
│   │
│   ├── lit/                     # Lit适配器
│   │   ├── src/
│   │   ├── examples/
│   │   └── ...
│   │
│   └── webcomponent/            # Web Components适配器
│       ├── src/
│       ├── examples/
│       └── ...
│
├── docs/                        # VitePress文档
│   ├── .vitepress/
│   │   └── config.ts
│   ├── guide/
│   │   ├── getting-started.md
│   │   ├── core-concepts.md
│   │   └── advanced.md
│   ├── api/
│   │   ├── core.md
│   │   ├── vue.md
│   │   ├── react.md
│   │   └── ...
│   ├── examples/
│   │   ├── vue/
│   │   ├── react/
│   │   └── ...
│   └── index.md
│
├── tools/                       # 内部工具（已存在）
│   ├── builder/                # @ldesign/builder
│   └── launcher/               # @ldesign/launcher
│
├── test/                        # 全局测试配置
│   ├── setup.ts
│   ├── utils/
│   └── fixtures/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── release.yml
│       └── docs.yml
│
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

---

## 🔍 现有功能分析

### ✅ 已实现的核心功能

1. **日历核心**
   - ✅ 多视图支持（月/周/日/议程）
   - ✅ 事件管理（CRUD操作）
   - ✅ 重复事件引擎（RRULE支持）
   - ✅ 虚拟滚动（大数据量优化）
   - ✅ Web Workers（异步计算）
   - ✅ 缓存管理器（LRU缓存）

2. **高级功能**
   - ✅ 时区管理
   - ✅ 农历和节假日
   - ✅ 事件提醒系统
   - ✅ 导入导出（iCal、CSV、JSON）
   - ✅ 打印功能
   - ✅ 高级搜索和过滤
   - ✅ 国际化（i18n）
   - ✅ 无障碍性（a11y）

3. **交互功能**
   - ✅ 拖拽移动
   - ✅ 调整大小
   - ✅ 快速创建
   - ✅ 点击事件处理

4. **渲染系统**
   - ✅ DOM渲染器
   - ✅ Canvas渲染器
   - ✅ 混合渲染器

5. **存储系统**
   - ✅ LocalStorage适配器
   - ✅ API适配器
   - ✅ 可插拔存储架构

### 🔧 需要优化的功能

1. **性能优化**
   - ⚠️ 对象池实现（减少GC压力）
   - ⚠️ 事件批处理优化
   - ⚠️ requestAnimationFrame节流
   - ⚠️ 内存泄漏检测和修复

2. **类型系统**
   - ⚠️ 消除any类型
   - ⚠️ 完善泛型支持
   - ⚠️ 更严格的类型定义
   - ⚠️ 导出完整的类型定义

3. **错误处理**
   - ⚠️ 统一的错误处理机制
   - ⚠️ 错误边界和降级策略
   - ⚠️ 更友好的错误提示

4. **代码质量**
   - ⚠️ ESLint配置和修复
   - ⚠️ 代码风格统一
   - ⚠️ 移除冗余代码

### 🆕 需要新增的功能

1. **撤销/重做系统**
   - 📝 Command模式实现
   - 📝 历史记录管理
   - 📝 状态快照

2. **键盘快捷键**
   - 📝 快捷键管理器
   - 📝 自定义快捷键
   - 📝 快捷键提示

3. **更多导出格式**
   - 📝 Excel格式
   - 📝 PDF格式
   - 📝 图片导出

4. **拖拽文件导入**
   - 📝 拖拽区域
   - 📝 文件解析
   - 📝 批量导入

---

## 🏗️ 实施计划

### 阶段1：项目结构规划（当前阶段）
- [x] 分析现有代码功能
- [x] 设计新的monorepo结构
- [ ] 设计统一的API规范
- [ ] 规划每个包的功能边界

### 阶段2：Core包重构
- [ ] 迁移核心模块到packages/core
- [ ] 优化性能（对象池、批处理等）
- [ ] 完善类型定义
- [ ] 实现新功能（撤销/重做、快捷键等）
- [ ] 配置@ldesign/builder
- [ ] 配置@antfu/eslint

### 阶段3-9：框架适配器开发
- [ ] Vue3适配器（Composition API）
- [ ] React适配器（Hooks）
- [ ] Svelte适配器
- [ ] Solid.js适配器
- [ ] Angular适配器
- [ ] Qwik适配器
- [ ] Preact适配器
- [ ] Lit适配器
- [ ] Web Components适配器

### 阶段10：文档系统
- [ ] 配置VitePress
- [ ] API文档生成
- [ ] 使用指南编写
- [ ] 框架集成指南
- [ ] 交互式示例

### 阶段11：测试体系
- [ ] 单元测试（Vitest）
- [ ] 可视化测试（Playwright）
- [ ] 性能测试
- [ ] 内存泄漏测试
- [ ] CI/CD配置

### 阶段12：性能优化验证
- [ ] 性能基准测试
- [ ] 内存测试
- [ ] 打包体积优化
- [ ] Tree-shaking验证

### 阶段13：最终验证和交付
- [ ] 构建验证
- [ ] ESLint检查
- [ ] 类型检查
- [ ] 测试验证
- [ ] 文档验证

---

## 📊 性能指标

### 目标性能指标

| 指标 | 目标值 | 测试场景 |
|------|--------|----------|
| 首次渲染时间 | <100ms | 50个事件 |
| 大数据量渲染 | <200ms | 1000个事件 |
| 内存占用 | <50MB | 1000个事件 |
| 帧率 | 60fps | 滚动和交互 |
| 打包体积（core） | <50KB | gzip后 |
| 打包体积（vue） | <30KB | gzip后 |
| 打包体积（react） | <30KB | gzip后 |

### 测试覆盖率目标

| 测试类型 | 目标覆盖率 |
|---------|-----------|
| 单元测试 | >90% |
| 集成测试 | >80% |
| E2E测试 | 核心功能100% |

---

## 🔧 技术栈

### 核心技术
- **语言**：TypeScript 5.7+
- **构建工具**：@ldesign/builder（支持rollup/rolldown/esbuild/swc）
- **开发服务器**：@ldesign/launcher（基于Vite）
- **包管理**：pnpm workspace
- **代码规范**：@antfu/eslint

### 测试技术
- **单元测试**：Vitest
- **E2E测试**：Playwright
- **性能测试**：自定义性能监控 + Lighthouse
- **内存测试**：Chrome DevTools Memory Profiler

### 文档技术
- **文档生成**：VitePress
- **API文档**：TypeDoc + 自定义插件
- **交互示例**：Vue3 + Vite

### 框架支持
- **Vue**：Vue 3.3+（Composition API）
- **React**：React 18+（Hooks）
- **Svelte**：Svelte 4+
- **Solid**：Solid.js 1.7+
- **Angular**：Angular 16+
- **Qwik**：Qwik 1.0+
- **Preact**：Preact 10+
- **Lit**：Lit 3+
- **Web Components**：原生API

---

## 📦 包发布策略

### 版本管理
- 使用changesets进行版本管理
- 独立版本号（每个包独立发布）
- 遵循语义化版本规范

### NPM包
- @ldesign/calendar-core
- @ldesign/calendar-vue
- @ldesign/calendar-react
- @ldesign/calendar-svelte
- @ldesign/calendar-solid
- @ldesign/calendar-angular
- @ldesign/calendar-qwik
- @ldesign/calendar-preact
- @ldesign/calendar-lit
- @ldesign/calendar-webcomponent

---

## 🎨 API设计原则

1. **一致性**：所有框架适配器提供相似的API
2. **类型安全**：完整的TypeScript类型支持
3. **灵活性**：支持自定义和扩展
4. **性能**：优先考虑性能和内存占用
5. **易用性**：简单的默认配置，强大的高级选项

---

## 📝 待确认事项

1. ✅ 框架支持范围（已确认：所有常见框架）
2. ✅ @ldesign/builder使用方式（已查阅文档）
3. ✅ @ldesign/launcher使用方式（已查阅文档）
4. ✅ 时间限制（已确认：不限时间）
5. ✅ 功能完整性优先级（已确认：功能完整优先，再深度优化）
6. [ ] 各框架的最低版本要求
7. [ ] 是否需要兼容旧版本浏览器
8. [ ] 是否需要SSR/SSG支持

---

## 📈 进度跟踪

总体进度：**5%**（阶段1进行中）

- [x] 阶段1：项目结构规划（进行中）
- [ ] 阶段2：Core包重构
- [ ] 阶段3-9：框架适配器开发
- [ ] 阶段10：文档系统
- [ ] 阶段11：测试体系
- [ ] 阶段12：性能优化验证
- [ ] 阶段13：最终验证和交付

---

**最后更新**：2025-01-28
**文档版本**：v1.0
