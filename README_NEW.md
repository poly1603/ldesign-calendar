# @ldesign/calendar

<div align="center">

# 📅 @ldesign/calendar

**企业级日历组件 - 支持原生JS、Vue3、React**

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](./CHANGELOG.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](./tsconfig.json)
[![Framework](https://img.shields.io/badge/framework-Vanilla%2FVue%2FReact-orange.svg)](#框架支持)

完整、灵活、高性能的日历组件 Monorepo

</div>

---

## 🎯 项目结构

本项目采用 **Monorepo** 架构，包含以下包：

```
libraries/calendar/
├── packages/
│   ├── core/                  # 核心功能包（纯 JS/TS）
│   ├── vue/                   # Vue3 组件
│   └── react/                 # React 组件
├── examples/
│   ├── vanilla/               # 原生 JS 示例
│   ├── vue/                   # Vue3 示例
│   └── react/                 # React 示例
├── package.json
└── pnpm-workspace.yaml
```

## ✨ 特性

### 🎨 多框架支持
- **@ldesign/calendar-core** - 纯 JavaScript/TypeScript 核心
- **@ldesign/calendar-vue** - Vue3 组件 + Composition API
- **@ldesign/calendar-react** - React 组件 + Hooks

### 🚀 核心功能
- ✅ **多种视图** - 月/周/日/议程视图
- ✅ **事件管理** - 完整的 CRUD 操作
- ✅ **拖拽交互** - 拖拽移动、调整大小
- ✅ **重复事件** - 支持多种重复规则
- ✅ **存储适配** - 灵活的存储方案
- ✅ **高性能** - 优化的日期计算和缓存
- ✅ **内存优化** - 资源清理和防泄漏
- ✅ **TypeScript** - 完整的类型支持

## 📦 安装

### 核心包（原生 JS）

```bash
pnpm add @ldesign/calendar-core
```

### Vue3

```bash
pnpm add @ldesign/calendar-vue
```

### React

```bash
pnpm add @ldesign/calendar-react
```

## 🚀 快速开始

### 原生 JavaScript

```typescript
import { createCalendar } from '@ldesign/calendar-core';

const calendar = createCalendar({
  initialView: 'month',
  editable: true,
  callbacks: {
    onEventClick: (event) => {
      console.log('Event clicked:', event);
    },
  },
});

await calendar.addEvent({
  title: '团队会议',
  start: new Date(2024, 0, 15, 10, 0),
  end: new Date(2024, 0, 15, 11, 30),
  color: '#1890ff',
});
```

### Vue3

```vue
<template>
  <LCalendar
    :config="calendarConfig"
    @event-click="handleEventClick"
  />
</template>

<script setup>
import { LCalendar } from '@ldesign/calendar-vue';

const calendarConfig = {
  initialView: 'month',
  editable: true,
};

const handleEventClick = (event) => {
  console.log('Event clicked:', event);
};
</script>
```

**或使用 Composition API:**

```vue
<script setup>
import { useCalendar } from '@ldesign/calendar-vue';

const {
  events,
  addEvent,
  changeView,
  next,
  prev,
  today,
} = useCalendar({
  initialView: 'week',
  editable: true,
});
</script>
```

### React

```tsx
import { Calendar } from '@ldesign/calendar-react';

function App() {
  const calendarRef = useRef<CalendarRef>(null);

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
  };

  return (
    <Calendar
      ref={calendarRef}
      config={{ initialView: 'month', editable: true }}
      onEventClick={handleEventClick}
    />
  );
}
```

**或使用 Hook:**

```tsx
import { useCalendar } from '@ldesign/calendar-react';

function App() {
  const {
    events,
    addEvent,
    changeView,
    next,
    prev,
    today,
  } = useCalendar({
    initialView: 'week',
    editable: true,
  });

  return <div>...</div>;
}
```

## 🛠️ 开发

### 安装依赖

```bash
pnpm install
```

### 构建所有包

```bash
pnpm build
```

### 构建单个包

```bash
pnpm build:core     # 构建核心包
pnpm build:vue      # 构建 Vue 包
pnpm build:react    # 构建 React 包
```

### 运行示例

```bash
pnpm dev:vanilla    # 运行原生 JS 示例 (端口 3000)
pnpm dev:vue        # 运行 Vue3 示例 (端口 3001)
pnpm dev:react      # 运行 React 示例 (端口 3002)
```

### 类型检查

```bash
pnpm typecheck
```

### 清理

```bash
pnpm clean
```

## 📚 文档

- [核心包文档](./packages/core/README.md)
- [Vue 包文档](./packages/vue/README.md)
- [React 包文档](./packages/react/README.md)
- [代码分析报告](./CODE_ANALYSIS.md)

## 🎯 优化亮点

### 性能优化
- ✅ 日期计算结果缓存
- ✅ 事件懒加载
- ✅ 优化的事件发射器
- ✅ 时间戳比较替代对象比较

### 内存优化
- ✅ WeakMap 避免内存泄漏
- ✅ 完善的资源清理
- ✅ 操作锁机制防止并发问题
- ✅ 缓存大小限制

### 代码质量
- ✅ 完整的 TypeScript 类型
- ✅ 统一的错误处理
- ✅ 完善的回滚机制
- ✅ 详细的注释和文档

## 🏗️ 架构设计

### 核心模块

1. **Calendar** - 主日历类，管理视图和事件
2. **EventManager** - 事件管理器，CRUD 操作
3. **ViewManager** - 视图管理器，日期导航
4. **EventEmitter** - 事件发射器，异步回调支持

### 工具模块

1. **Date Utils** - 日期工具函数（优化+缓存）
2. **Event Utils** - 事件工具函数
3. **Storage Adapters** - 存储适配器

### 框架适配

1. **Vue3** - 组件 + Composition API
2. **React** - 组件 + Hooks

## 🔧 技术栈

- **TypeScript 5.7+** - 类型系统
- **Vite 5** - 构建工具
- **tsup** - TypeScript 打包
- **pnpm** - 包管理器
- **Vue 3.4+** - Vue 框架
- **React 18+** - React 框架

## 📊 包信息

| 包名 | 版本 | 描述 | 大小 |
|------|------|------|------|
| @ldesign/calendar-core | 0.2.0 | 核心功能包 | ~20KB |
| @ldesign/calendar-vue | 0.2.0 | Vue3 组件 | ~5KB + core |
| @ldesign/calendar-react | 0.2.0 | React 组件 | ~5KB + core |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT © LDesign Team

---

<div align="center">

**享受使用 @ldesign/calendar！** 🎉

</div>

