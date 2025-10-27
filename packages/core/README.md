# @ldesign/calendar-core

日历核心功能包 - 纯 JavaScript/TypeScript 实现，无框架依赖。

## ✨ 特性

- 🎯 **纯 TypeScript** - 完整的类型支持
- 🚀 **高性能** - 优化的日期计算和事件管理
- 💾 **内存优化** - 缓存机制和资源清理
- 🔧 **可扩展** - 插件式存储适配器
- 📦 **零依赖** - 不依赖任何第三方库

## 📦 安装

```bash
npm install @ldesign/calendar-core
# 或
pnpm add @ldesign/calendar-core
```

## 🚀 快速开始

```typescript
import { createCalendar } from '@ldesign/calendar-core';

const calendar = createCalendar({
  initialView: 'month',
  initialDate: new Date(),
  editable: true,
  callbacks: {
    onEventClick: (event) => {
      console.log('Event clicked:', event);
    },
  },
});

// 添加事件
await calendar.addEvent({
  title: '团队会议',
  start: new Date(2024, 0, 15, 10, 0),
  end: new Date(2024, 0, 15, 11, 30),
  color: '#1890ff',
});

// 获取事件
const events = calendar.getEvents();

// 切换视图
calendar.changeView('week');

// 导航
calendar.next();
calendar.prev();
calendar.today();
```

## 📖 API 文档

### Calendar

主日历类，管理视图和事件。

#### 创建实例

```typescript
import { Calendar } from '@ldesign/calendar-core';

const calendar = new Calendar({
  initialView: 'month',
  initialDate: new Date(),
  firstDayOfWeek: 0, // 0 = 周日
  editable: true,
  selectable: true,
});
```

#### 方法

- `changeView(view: CalendarView)` - 切换视图
- `next()` - 下一个周期
- `prev()` - 上一个周期
- `today()` - 跳转到今天
- `gotoDate(date: Date)` - 跳转到指定日期
- `addEvent(event)` - 添加事件
- `updateEvent(id, updates)` - 更新事件
- `deleteEvent(id)` - 删除事件
- `getEvents(start?, end?)` - 获取事件列表
- `getEvent(id)` - 获取单个事件
- `on(event, callback)` - 监听事件
- `off(event, callback)` - 取消监听
- `destroy()` - 销毁实例

### EventManager

事件管理器，处理事件的 CRUD 操作。

```typescript
import { EventManager } from '@ldesign/calendar-core';

const manager = new EventManager();
await manager.init();

await manager.createEvent({
  id: 'event1',
  title: '会议',
  start: new Date(),
  end: new Date(),
});

const events = manager.getEvents();
```

### ViewManager

视图管理器，处理视图切换和日期导航。

```typescript
import { ViewManager } from '@ldesign/calendar-core';

const viewManager = new ViewManager('month', new Date(), 0);

viewManager.next();
viewManager.prev();
viewManager.today();

const dateRange = viewManager.getDateRange();
```

## 🛠️ 工具函数

### 日期工具

```typescript
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addMonths,
  formatDate,
  isSameDay,
} from '@ldesign/calendar-core';

const weekStart = startOfWeek(new Date(), 0);
const monthStart = startOfMonth(new Date());
const nextWeek = addDays(new Date(), 7);
```

### 事件工具

```typescript
import {
  generateId,
  hasOverlap,
  sortEvents,
  validateEvent,
  calculateEventLayout,
} from '@ldesign/calendar-core';

const id = generateId();
const overlap = hasOverlap(event1, event2);
const sorted = sortEvents(events);
const errors = validateEvent(event);
```

## 📝 类型定义

```typescript
import type {
  CalendarView,
  CalendarEvent,
  CalendarConfig,
  RecurrenceRule,
  StorageAdapter,
} from '@ldesign/calendar-core';
```

## 🔧 自定义存储

实现自定义存储适配器：

```typescript
import type { StorageAdapter, CalendarEvent } from '@ldesign/calendar-core';

class CustomAdapter implements StorageAdapter {
  async save(events: CalendarEvent[]): Promise<void> {
    // 保存到你的后端
  }

  async load(): Promise<CalendarEvent[]> {
    // 从后端加载
    return [];
  }

  async clear(): Promise<void> {
    // 清除数据
  }
}

const calendar = createCalendar({
  storage: new CustomAdapter(),
});
```

## 📄 License

MIT © LDesign Team

