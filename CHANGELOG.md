# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2024-01-XX

### Added

- ✨ 核心日历功能
  - 月视图（Month View）- 6周网格布局
  - 周视图（Week View）- 时间轴 + 7列日期
  - 日视图（Day View）- 单日详细视图
  - 议程视图（Agenda View）- 列表模式

- 🎯 事件管理（CRUD）
  - 创建事件（支持全天事件）
  - 更新事件
  - 删除事件
  - 查询事件（支持日期范围）
  - 搜索事件（标题/描述/地点）

- 🔄 重复事件（Recurrence）
  - 支持每天/每周/每月/每年重复
  - 支持间隔（每N天）
  - 支持指定星期（BYDAY）
  - 支持结束日期（until）或重复次数（count）
  - RRULE 解析与生成

- 🖱️ 交互功能
  - 拖拽移动事件
  - 调整事件大小（拖拽边缘）
  - 拖拽创建新事件
  - 事件点击
  - 日期点击
  - 日期范围选择

- 💾 存储系统
  - LocalStorage 适配器（离线存储）
  - API 适配器接口（预留后端集成）
  - 自定义存储适配器支持

- 🎨 渲染引擎
  - DOM 渲染器（UI 框架）
  - Canvas 渲染器（性能优化）
  - 混合渲染模式（DOM + Canvas）
  - 高 DPI 屏幕支持

- 🧩 框架适配器
  - Vue 3 组件 + Composition API
  - React 组件 + Hooks
  - Web Component（标准自定义元素）

- 🌍 国际化
  - 中文支持
  - 时区支持（基础）
  - 可配置日期/时间格式

- 🎨 样式与主题
  - 默认主题
  - 响应式布局
  - 移动端适配

### Features

- 完整的 TypeScript 类型定义
- 事件委托与回调系统
- 视图管理与导航
- 工具栏（今天/前后导航/视图切换）
- 工作时间配置
- 周末显示/隐藏
- 自定义渲染函数
- 事件验证
- 错误处理

### Developer Experience

- 完整的 API 文档
- 使用示例（Vanilla JS / Vue / React / Web Component）
- TypeScript 支持
- 模块化架构
- 可扩展设计

## [0.2.0] - 计划中

### Planned

- 资源视图（Resource View）
- iCal 导入/导出
- 事件提醒
- 更多主题
- 性能优化（虚拟滚动）
- 更完善的时区支持

