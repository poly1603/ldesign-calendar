# 🚀 启动 @ldesign/calendar 演示项目

## 快速启动

### 方式一：直接启动（推荐）

```bash
cd libraries/calendar/demo
pnpm install
pnpm dev
```

浏览器会自动打开 http://localhost:3000

### 方式二：从项目根目录启动

```bash
# 在项目根目录
pnpm install
cd libraries/calendar/demo
pnpm dev
```

## 📦 演示内容

### 1. 🍦 Vanilla JavaScript
- 纯 JavaScript 使用示例
- 完整的事件管理
- 实时事件列表

### 2. 💚 Vue 3
- Composition API 示例
- 响应式状态管理
- 实时统计信息

### 3. ⚛️ React
- 组件使用示例
- Hook 使用示例
- TypeScript 类型支持

### 4. 🧩 Web Component
- 标准自定义元素
- 浏览器兼容性说明
- HTML + JavaScript 示例

### 5. ✨ 功能展示
- 完整功能清单
- 特性说明
- 未来规划

## 🎯 体验功能

### 基础操作
- ✅ 点击日期创建事件
- ✅ 拖拽移动事件
- ✅ 调整事件大小
- ✅ 点击事件查看详情
- ✅ 删除事件

### 视图切换
- 📅 月视图 - 查看整月日程
- 📆 周视图 - 查看一周安排
- 📋 日视图 - 查看单日详情
- 📃 议程视图 - 列表模式

### 导航操作
- 🏠 今天 - 跳转到今天
- ◀️ 上一个 - 上一个月/周/日
- ▶️ 下一个 - 下一个月/周/日

## 🔧 开发调试

### 查看源码
演示项目源码位于：
- `demo/src/App.vue` - 主应用
- `demo/src/components/` - 各演示组件

### 日历源码
日历核心代码位于：
- `src/core/` - 核心模块
- `src/types/` - 类型定义
- `src/utils/` - 工具函数
- `src/renderers/` - 渲染引擎
- `src/adapters/` - 框架适配器

### 调试技巧
```javascript
// 在浏览器控制台
window.calendar // Vanilla JS 示例的日历实例

// 查看所有事件
calendar.getEvents()

// 添加事件
calendar.addEvent({
  title: '测试事件',
  start: new Date(),
  end: new Date(Date.now() + 3600000)
})
```

## 📱 移动端测试

演示项目完全响应式，可在移动设备上测试：

1. 启动开发服务器
2. 在移动设备上访问：`http://YOUR_IP:3000`
3. 或使用浏览器的移动设备模拟器

## ⚡ 性能测试

### 大量事件测试
```javascript
// 批量添加事件
for (let i = 0; i < 100; i++) {
  calendar.addEvent({
    title: `事件 ${i}`,
    start: new Date(2024, 0, Math.floor(Math.random() * 30) + 1, 10, 0),
    end: new Date(2024, 0, Math.floor(Math.random() * 30) + 1, 11, 0),
  });
}
```

### Canvas 渲染测试
当事件数量超过 50 个时，会自动启用 Canvas 渲染以提升性能。

## 🐛 常见问题

### Q: 端口被占用？
```bash
# 修改端口
pnpm dev --port 3001
```

### Q: 找不到模块？
```bash
# 重新安装依赖
rm -rf node_modules
pnpm install
```

### Q: 样式不生效？
确保导入了样式文件：
```javascript
import '@ldesign/calendar/src/styles/calendar.css';
```

## 📚 更多资源

- [完整文档](../README.md)
- [API 文档](../README.md#api-文档)
- [实现总结](../IMPLEMENTATION_SUMMARY.md)
- [变更日志](../CHANGELOG.md)

## 🎉 开始体验

准备好了吗？运行 `pnpm dev` 开始体验吧！

