# 日历核心库测试 Demo

这是一个用于测试 `@ldesign/calendar-core` 核心功能的演示项目。

## 功能测试

此 Demo 测试以下所有核心模块：

1. ✅ **DateUtil** - 日期工具类
2. ✅ **LunarCalendar** - 农历模块
3. ✅ **I18n** - 国际化系统
4. ✅ **HolidayManager** - 节假日管理
5. ✅ **EventManager** - 事件管理
6. ✅ **ThemeManager** - 主题系统
7. ✅ **CalendarCore** - 核心状态管理
8. ✅ **ViewStrategy** - 视图渲染策略
9. ✅ **DatePicker** - 日期选择器
10. ✅ **RangePicker** - 范围选择器

## 运行方式

### 1. 安装依赖

在项目根目录运行：

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
cd examples/demo
pnpm dev
```

### 3. 打开浏览器

访问 http://localhost:3000

## 配置说明

- **Vite 配置**: 使用 alias 映射到 core 源码
- **TypeScript**: 严格模式，完整类型检查
- **源码映射**: 直接使用 `packages/core/src` 源码

## 测试内容

每个模块都会进行功能测试并在页面上显示结果：

- 基础功能验证
- API 调用测试
- 数据格式检查
- 集成测试

## 注意事项

1. 确保已在根目录安装依赖
2. 本 Demo 直接使用源码，无需构建 core 包
3. 所有测试结果会在浏览器控制台和页面上显示