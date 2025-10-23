# @ldesign/calendar

<div align="center">

# 📅 @ldesign/calendar

**企业级日历组件 - 月/周/日视图、事件管理、拖拽调整、重复事件**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./CHANGELOG.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](./tsconfig.json)
[![Views](https://img.shields.io/badge/views-Month%2FWeek%2FDay%2FAgenda-green.svg)](#功能特性)
[![Framework](https://img.shields.io/badge/framework-Vue%2FReact%2FWebComponent-orange.svg)](#框架支持)

完整、灵活、高性能的日历组件，支持任意框架使用

[功能特性](#功能特性) • [快速开始](#快速开始) • [API 文档](#api-文档) • [示例](#示例)

</div>

---

## ✨ 功能特性

### 🗓️ 多种视图
- **月视图** - 6周网格布局，清晰展示整月事件
- **周视图** - 时间轴 + 7列日期，精确到分钟
- **日视图** - 单日详细视图，事件详情一览无余
- **议程视图** - 列表模式，快速浏览事件清单

### 📝 事件管理
- ✅ **完整 CRUD** - 创建、读取、更新、删除
- ✅ **全天事件** - 支持全天事件标记
- ✅ **事件搜索** - 按标题、描述、地点搜索
- ✅ **事件验证** - 自动验证事件数据完整性

### 🔄 重复事件
- 📆 **多种频率** - 每天/每周/每月/每年
- 📆 **自定义间隔** - 每N天重复
- 📆 **指定星期** - 每周一、三、五
- 📆 **结束条件** - 指定日期或重复次数
- 📆 **RRULE 支持** - 标准重复规则

### 🖱️ 交互功能
- 👆 **拖拽移动** - 直接拖拽事件到新日期
- ↕️ **调整大小** - 拖拽边缘调整事件时长
- ➕ **拖拽创建** - 在空白处拖拽创建新事件
- 🖱️ **事件/日期点击** - 丰富的交互回调

### 💾 存储系统
- 📦 **LocalStorage** - 离线存储，自动持久化
- 🌐 **API 适配器** - 轻松对接后端接口
- 🔧 **自定义适配器** - 灵活扩展存储方案

### 🎨 渲染引擎
- 🖼️ **混合渲染** - DOM + Canvas 混合模式
- ⚡ **高性能** - Canvas 加速，支持大量事件
- 📱 **响应式** - 完美适配移动端
- 🎯 **高 DPI** - 自动处理 Retina 屏幕

### 🧩 框架支持
- **Vue 3** - 组件 + Composition API
- **React** - 组件 + Hooks
- **Web Component** - 标准自定义元素
- **Vanilla JS** - 纯 JavaScript 使用

---

## 🚀 快速开始

### 安装

```bash
npm install @ldesign/calendar
# 或
pnpm add @ldesign/calendar
```

### Vanilla JavaScript

```javascript
import { createCalendar } from '@ldesign/calendar';
import '@ldesign/calendar/dist/calendar.css';

const calendar = createCalendar('#calendar', {
  initialView: 'month',
  editable: true,
  selectable: true,
  callbacks: {
    onEventClick: (event) => {
      console.log('点击事件:', event);
    },
    onDateSelect: (start, end) => {
      calendar.addEvent({
        title: '新事件',
        start,
        end,
      });
    },
  },
});

// 添加事件
calendar.addEvent({
  title: '团队会议',
  start: new Date(2024, 0, 15, 10, 0),
  end: new Date(2024, 0, 15, 11, 30),
  color: '#1890ff',
});
```

### Vue 3

```vue
<template>
  <LCalendar
    :config="calendarConfig"
    @event-click="handleEventClick"
    @date-select="handleDateSelect"
  />
</template>

<script setup>
import { LCalendar } from '@ldesign/calendar/vue';
import '@ldesign/calendar/dist/calendar.css';

const calendarConfig = {
  initialView: 'month',
  editable: true,
  selectable: true,
};

const handleEventClick = (event) => {
  console.log('点击事件:', event);
};

const handleDateSelect = (start, end) => {
  // 创建新事件
};
</script>
```

**Composition API:**

```vue
<script setup>
import { useCalendar } from '@ldesign/calendar/vue';

const {
  calendarRef,
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

const handleAddEvent = async () => {
  await addEvent({
    title: '新事件',
    start: new Date(),
    end: new Date(),
  });
};
</script>

<template>
  <div ref="calendarRef"></div>
</template>
```

### React

```tsx
import React, { useRef } from 'react';
import { Calendar, CalendarRef } from '@ldesign/calendar/react';
import '@ldesign/calendar/dist/calendar.css';

function App() {
  const calendarRef = useRef<CalendarRef>(null);

  const handleEventClick = (event) => {
    console.log('点击事件:', event);
  };

  const handleDateSelect = async (start, end) => {
    await calendarRef.current?.addEvent({
      title: '新事件',
      start,
      end,
    });
  };

  return (
    <Calendar
      ref={calendarRef}
      config={{ initialView: 'month', editable: true }}
      onEventClick={handleEventClick}
      onDateSelect={handleDateSelect}
    />
  );
}
```

**使用 Hook:**

```tsx
import { useCalendar } from '@ldesign/calendar/react';

function App() {
  const {
    calendarRef,
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

  return <div ref={calendarRef} />;
}
```

### Web Component

```html
<ldesign-calendar 
  view="month"
  editable="true"
  selectable="true"
></ldesign-calendar>

<script type="module">
  import '@ldesign/calendar/webcomponent';
  
  const calendar = document.querySelector('ldesign-calendar');
  
  calendar.addEventListener('event-click', (e) => {
    console.log('点击事件:', e.detail);
  });
  
  calendar.addEvent({
    title: '团队会议',
    start: new Date(2024, 0, 15, 10, 0),
    end: new Date(2024, 0, 15, 11, 30),
  });
</script>
```

---

## 📖 API 文档

### Calendar 配置

```typescript
interface CalendarConfig {
  // 视图配置
  initialView?: 'month' | 'week' | 'day' | 'agenda'; // 默认: 'month'
  initialDate?: Date; // 默认: new Date()
  
  // 工具栏配置
  toolbar?: {
    title?: boolean; // 显示标题
    today?: boolean; // 显示"今天"按钮
    navigation?: boolean; // 显示前后导航
    viewSwitcher?: boolean; // 显示视图切换
    customButtons?: ToolbarButton[]; // 自定义按钮
  };
  
  // 时间配置
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = 周日
  businessHoursStart?: number; // 工作时间开始 (0-24)
  businessHoursEnd?: number; // 工作时间结束 (0-24)
  timeZone?: string; // 时区
  weekends?: boolean; // 显示周末
  timeFormat?: string; // 时间格式
  dateFormat?: string; // 日期格式
  
  // 事件配置
  defaultEventDuration?: number; // 默认事件时长（分钟）
  slotDuration?: number; // 时间间隔（分钟）
  editable?: boolean; // 是否可编辑
  selectable?: boolean; // 是否可选择
  
  // 样式配置
  height?: number | 'auto';
  width?: number | 'auto';
  theme?: string;
  locale?: string;
  
  // 存储配置
  storage?: StorageAdapter;
  
  // 回调函数
  callbacks?: {
    onEventClick?: (event: CalendarEvent) => void;
    onEventCreate?: (event: CalendarEvent) => void | boolean;
    onEventUpdate?: (event: CalendarEvent, oldEvent: CalendarEvent) => void | boolean;
    onEventDelete?: (id: string) => void | boolean;
    onDateSelect?: (start: Date, end: Date) => void;
    onDateClick?: (date: Date) => void;
    onViewChange?: (view: CalendarView, date: Date) => void;
  };
}
```

### CalendarEvent 事件对象

```typescript
interface CalendarEvent {
  id: string; // 唯一标识
  title: string; // 标题
  start: Date; // 开始时间
  end: Date; // 结束时间
  allDay?: boolean; // 是否全天
  color?: string; // 颜色
  backgroundColor?: string; // 背景色
  borderColor?: string; // 边框色
  textColor?: string; // 文字色
  description?: string; // 描述
  location?: string; // 地点
  recurrence?: RecurrenceRule; // 重复规则
  editable?: boolean; // 是否可编辑
  draggable?: boolean; // 是否可拖拽
  resizable?: boolean; // 是否可调整大小
  extendedProps?: Record<string, any>; // 自定义数据
}
```

### RecurrenceRule 重复规则

```typescript
interface RecurrenceRule {
  freq: 'daily' | 'weekly' | 'monthly' | 'yearly'; // 频率
  interval?: number; // 间隔（每N天/周/月/年）
  until?: Date; // 结束日期
  count?: number; // 重复次数
  byweekday?: number[]; // 每周的哪几天 (0-6)
  bymonthday?: number[]; // 每月的第几天
  bymonth?: number[]; // 每年的第几月
}
```

### Calendar 方法

```typescript
class Calendar {
  // 视图控制
  changeView(view: CalendarView): void;
  next(): void;
  prev(): void;
  today(): void;
  gotoDate(date: Date): void;
  
  // 事件操作
  addEvent(event: Omit<CalendarEvent, 'id'>): Promise<string>;
  updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<void>;
  deleteEvent(id: string): Promise<void>;
  getEvents(start?: Date, end?: Date): CalendarEvent[];
  getEvent(id: string): CalendarEvent | null;
  
  // 事件监听
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
  
  // 生命周期
  render(): void;
  destroy(): void;
}
```

---

## 🎯 高级功能

### 重复事件

```javascript
// 每周一、三、五重复
calendar.addEvent({
  title: '晨会',
  start: new Date(2024, 0, 8, 9, 0),
  end: new Date(2024, 0, 8, 9, 30),
  recurrence: {
    freq: 'weekly',
    byweekday: [1, 3, 5], // 周一、三、五
    count: 20, // 重复20次
  },
});

// 每月15号
calendar.addEvent({
  title: '月度总结',
  start: new Date(2024, 0, 15, 14, 0),
  end: new Date(2024, 0, 15, 16, 0),
  recurrence: {
    freq: 'monthly',
    bymonthday: [15],
    until: new Date(2024, 11, 31),
  },
});
```

### 自定义存储

```javascript
import { ApiAdapter } from '@ldesign/calendar';

const apiAdapter = new ApiAdapter({
  baseUrl: 'https://api.example.com',
  endpoints: {
    list: '/calendar/events',
    create: '/calendar/events',
    update: '/calendar/events/:id',
    delete: '/calendar/events/:id',
  },
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
  },
  transform: {
    request: (data) => {
      // 转换请求数据
      return data;
    },
    response: (data) => {
      // 转换响应数据
      return data.events;
    },
  },
});

const calendar = createCalendar('#calendar', {
  storage: apiAdapter,
});
```

---

## 🎨 主题定制

```css
/* 自定义颜色 */
.ldesign-calendar {
  --primary-color: #1890ff;
  --border-color: #e8e8e8;
  --text-color: #262626;
  --background-color: #fff;
}

/* 自定义事件样式 */
.ldesign-calendar-event {
  border-radius: 4px;
  font-weight: 500;
}

.ldesign-calendar-event.important {
  border-left-width: 4px;
  font-weight: 600;
}
```

---

## 📦 构建与开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 运行示例
pnpm serve
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 License

MIT © LDesign Team

---

## 🔗 参考项目

本项目参考了以下优秀的日历组件：

- [fullcalendar](https://fullcalendar.io/) - 功能最全、插件丰富
- [tui-calendar](https://github.com/nhn/tui.calendar) - UI 精美
- [vue-cal](https://github.com/antoniandre/vue-cal) - Vue 3 原生
- [react-big-calendar](https://github.com/jquense/react-big-calendar) - React 标准
- [schedule-x](https://github.com/schedule-x/schedule-x) - 现代化设计

---

<div align="center">

**享受使用 @ldesign/calendar！** 🎉

[⬆ 回到顶部](#ldesigncalendar)

</div>
