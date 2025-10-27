# 🚀 快速启动指南

## 📋 前置要求

- Node.js >= 18
- pnpm >= 8

## 🔧 安装和构建

### 1. 安装依赖

```bash
cd libraries/calendar
pnpm install
```

### 2. 构建所有包

```bash
# 构建所有包（core, vue, react）
pnpm build

# 或者单独构建
pnpm build:core     # 构建核心包
pnpm build:vue      # 构建 Vue 包
pnpm build:react    # 构建 React 包
```

## 🎮 运行示例

### 原生 JavaScript 示例

```bash
pnpm dev:vanilla
```

然后打开浏览器访问: http://localhost:3000

### Vue3 示例

```bash
pnpm dev:vue
```

然后打开浏览器访问: http://localhost:3001

### React 示例

```bash
pnpm dev:react
```

然后打开浏览器访问: http://localhost:3002

## 📦 包结构

```
packages/
├── core/          # @ldesign/calendar-core
├── vue/           # @ldesign/calendar-vue
└── react/         # @ldesign/calendar-react

examples/
├── vanilla/       # 原生 JS 示例 (端口 3000)
├── vue/           # Vue3 示例 (端口 3001)
└── react/         # React 示例 (端口 3002)
```

## 🔍 验证构建

构建成功后，每个包会生成以下文件：

### @ldesign/calendar-core
```
packages/core/dist/
├── index.js        # ESM 入口
├── index.cjs       # CommonJS 入口
├── index.d.ts      # TypeScript 类型
├── calendar.js
├── calendar.cjs
├── calendar.d.ts
├── event-manager.js
├── event-manager.cjs
├── event-manager.d.ts
└── ...
```

### @ldesign/calendar-vue
```
packages/vue/dist/
├── index.js        # ESM 入口
├── index.cjs       # CommonJS 入口
├── index.d.ts      # TypeScript 类型
└── style.css       # 样式（可选）
```

### @ldesign/calendar-react
```
packages/react/dist/
├── index.js        # ESM 入口
├── index.cjs       # CommonJS 入口
├── index.d.ts      # TypeScript 类型
└── style.css       # 样式（可选）
```

## ✅ 功能测试清单

### 基础功能
- [ ] 日历渲染正常
- [ ] 视图切换（月/周/日）
- [ ] 导航（上一个/下一个/今天）
- [ ] 添加事件
- [ ] 编辑事件
- [ ] 删除事件
- [ ] 事件点击
- [ ] 日期选择

### 框架特定
- [ ] Vue3 组件正常工作
- [ ] Vue3 Composable 正常工作
- [ ] React 组件正常工作
- [ ] React Hook 正常工作
- [ ] 原生 JS API 正常工作

### 性能
- [ ] 无内存泄漏
- [ ] 无明显性能问题
- [ ] 响应速度快

## 🐛 常见问题

### Q: pnpm install 失败
A: 确保 Node.js 版本 >= 18，pnpm 版本 >= 8

### Q: 构建失败
A: 先执行 `pnpm clean` 清理，然后重新构建

### Q: 示例启动失败
A: 确保先执行 `pnpm build` 构建所有包

### Q: 类型错误
A: 执行 `pnpm typecheck` 检查类型错误

### Q: Vite 别名不工作
A: 检查 vite.config.ts 中的 alias 配置是否正确

## 📝 开发模式

开发模式下，Vite 使用别名直接引用源代码，无需构建：

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/calendar-core': resolve(__dirname, '../../packages/core/src'),
      '@ldesign/calendar-vue': resolve(__dirname, '../../packages/vue/src'),
    },
  },
});
```

这样可以实时看到代码修改的效果，无需重新构建。

## 🎯 下一步

1. 查看 [完整文档](./README_NEW.md)
2. 查看 [实施报告](./IMPLEMENTATION_COMPLETE.md)
3. 查看 [代码分析](./CODE_ANALYSIS.md)
4. 开始使用你喜欢的框架！

## 💡 提示

- 开发时推荐使用 `pnpm dev:*` 命令启动示例
- 构建时使用 `pnpm build` 构建所有包
- 类型检查使用 `pnpm typecheck`
- 清理使用 `pnpm clean`

祝你使用愉快！ 🎉

