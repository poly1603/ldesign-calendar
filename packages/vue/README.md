# @ldesign/calendar-vue

Vue3 日历组件

## 📦 安装

```bash
npm install @ldesign/calendar-vue
# 或
pnpm add @ldesign/calendar-vue
```

## 🚀 快速开始

### 组件方式

```vue
<template>
  <LCalendar
    :config="calendarConfig"
    @event-click="handleEventClick"
    @date-select="handleDateSelect"
  />
</template>

<script setup>
import { LCalendar } from '@ldesign/calendar-vue';

const calendarConfig = {
  initialView: 'month',
  editable: true,
  selectable: true,
};

const handleEventClick = (event) => {
  console.log('点击事件:', event);
};

const handleDateSelect = (start, end) => {
  console.log('选择日期:', start, end);
};
</script>
```

### Composition API

```vue
<script setup>
import { useCalendar } from '@ldesign/calendar-vue';

const {
  events,
  currentView,
  currentDate,
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
  <div>
    <div class="toolbar">
      <button @click="prev">上一个</button>
      <button @click="today">今天</button>
      <button @click="next">下一个</button>
      <button @click="changeView('month')">月</button>
      <button @click="changeView('week')">周</button>
      <button @click="changeView('day')">日</button>
      <button @click="handleAddEvent">添加事件</button>
    </div>
    <div>当前: {{ currentDate }}</div>
    <div>事件数: {{ events.length }}</div>
  </div>
</template>
```

## 📖 API

### 组件 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| config | CalendarConfig | {} | 日历配置 |

### 组件 Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| event-click | (event: CalendarEvent) | 事件点击 |
| event-create | (event: CalendarEvent) | 事件创建 |
| event-update | (event, oldEvent) | 事件更新 |
| event-delete | (eventId: string) | 事件删除 |
| date-select | (start: Date, end: Date) | 日期选择 |
| date-click | (date: Date) | 日期点击 |
| view-change | (view, date) | 视图变化 |
| render | (data: any) | 渲染事件 |

### useCalendar 返回值

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| calendar | Ref<Calendar> | 日历实例 |
| events | Ref<CalendarEvent[]> | 事件列表 |
| currentView | Ref<CalendarView> | 当前视图 |
| currentDate | Ref<Date> | 当前日期 |
| changeView | (view) => void | 切换视图 |
| next | () => void | 下一个周期 |
| prev | () => void | 上一个周期 |
| today | () => void | 跳转到今天 |
| gotoDate | (date) => void | 跳转到指定日期 |
| addEvent | (event) => Promise<string> | 添加事件 |
| updateEvent | (id, updates) => Promise<void> | 更新事件 |
| deleteEvent | (id) => Promise<void> | 删除事件 |
| getEvents | (start?, end?) => CalendarEvent[] | 获取事件 |
| getEvent | (id) => CalendarEvent\|null | 获取单个事件 |
| refresh | () => void | 刷新 |

## 📄 License

MIT © LDesign Team

