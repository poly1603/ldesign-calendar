# @ldesign/calendar-react

React 日历组件

## 📦 安装

```bash
npm install @ldesign/calendar-react
# 或
pnpm add @ldesign/calendar-react
```

## 🚀 快速开始

### 组件方式

```tsx
import React, { useRef } from 'react';
import { Calendar, CalendarRef } from '@ldesign/calendar-react';

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

### Hook 方式

```tsx
import React from 'react';
import { useCalendar } from '@ldesign/calendar-react';

function App() {
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

  return (
    <div>
      <div className="toolbar">
        <button onClick={prev}>上一个</button>
        <button onClick={today}>今天</button>
        <button onClick={next}>下一个</button>
        <button onClick={() => changeView('month')}>月</button>
        <button onClick={() => changeView('week')}>周</button>
        <button onClick={() => changeView('day')}>日</button>
        <button onClick={handleAddEvent}>添加事件</button>
      </div>
      <div>当前: {currentDate.toLocaleDateString()}</div>
      <div>事件数: {events.length}</div>
    </div>
  );
}
```

## 📖 API

### 组件 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| config | CalendarConfig | {} | 日历配置 |
| onEventClick | (event) => void | - | 事件点击回调 |
| onEventCreate | (event) => void\|boolean\|Promise | - | 事件创建回调 |
| onEventUpdate | (event, oldEvent) => void\|boolean\|Promise | - | 事件更新回调 |
| onEventDelete | (eventId) => void\|boolean\|Promise | - | 事件删除回调 |
| onDateSelect | (start, end) => void | - | 日期选择回调 |
| onDateClick | (date) => void | - | 日期点击回调 |
| onViewChange | (view, date) => void | - | 视图变化回调 |
| onRender | (data) => void | - | 渲染回调 |

### 组件 Ref 方法

| 方法 | 类型 | 说明 |
|------|------|------|
| getInstance | () => Calendar | 获取日历实例 |
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
| getCurrentView | () => CalendarView | 获取当前视图 |
| getCurrentDate | () => Date | 获取当前日期 |
| refresh | () => void | 刷新 |

### useCalendar 返回值

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| calendar | Calendar\|null | 日历实例 |
| events | CalendarEvent[] | 事件列表 |
| currentView | CalendarView | 当前视图 |
| currentDate | Date | 当前日期 |
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

