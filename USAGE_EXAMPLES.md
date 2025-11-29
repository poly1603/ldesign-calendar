# 日历插件使用示例

## 1. 基础日历使用

### 1.1 简单日历

```vue
<template>
  <Calendar
    v-model="selectedDate"
    :show-lunar="true"
    @select="handleDateSelect"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@ldesign/calendar-vue'

const selectedDate = ref<Date>(new Date())

const handleDateSelect = (date: Date) => {
  console.log('选中日期:', date)
}
</script>
```

### 1.2 带事件的日历

```vue
<template>
  <Calendar
    v-model="selectedDate"
    :events="events"
    :show-lunar="true"
    @event-click="handleEventClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@ldesign/calendar-vue'
import type { CalendarEvent } from '@ldesign/calendar-core'

const selectedDate = ref<Date>(new Date())

const events = ref<CalendarEvent[]>([
  {
    id: '1',
    title: '团队会议',
    start: new Date(2024, 0, 15, 10, 0),
    end: new Date(2024, 0, 15, 11, 0),
    allDay: false,
    color: '#1890ff',
  },
])

const handleEventClick = (event: CalendarEvent) => {
  console.log('点击事件:', event)
}
</script>
```

### 1.3 多视图切换

```vue
<template>
  <div>
    <button @click="viewMode = 'month'">月视图</button>
    <button @click="viewMode = 'week'">周视图</button>
    <button @click="viewMode = 'day'">日视图</button>
    
    <Calendar
      v-model="selectedDate"
      :view-mode="viewMode"
      :events="events"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@ldesign/calendar-vue'
import type { ViewMode } from '@ldesign/calendar-core'

const selectedDate = ref<Date>(new Date())
const viewMode = ref<ViewMode>('month')
const events = ref([])
</script>
```

## 2. 日期选择器使用

### 2.1 基础日期选择器

```vue
<template>
  <DatePicker
    v-model="selectedDate"
    placeholder="请选择日期"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@ldesign/calendar-vue'

const selectedDate = ref<Date | null>(null)

const handleChange = (date: Date | null) => {
  console.log('选中日期:', date)
}
</script>
```

### 2.2 日期范围选择器

```vue
<template>
  <DateRangePicker
    v-model="dateRange"
    :max-range="30"
    placeholder="请选择日期范围"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DateRangePicker } from '@ldesign/calendar-vue'

const dateRange = ref<{ start: Date; end: Date } | null>(null)
</script>
```

### 2.3 带限制的选择器

```vue
<template>
  <DatePicker
    v-model="selectedDate"
    :min-date="minDate"
    :max-date="maxDate"
    :disabled-dates="disabledDates"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@ldesign/calendar-vue'

const selectedDate = ref<Date | null>(null)
const minDate = new Date(2024, 0, 1)
const maxDate = new Date(2024, 11, 31)
const disabledDates = [
  new Date(2024, 0, 15),
  new Date(2024, 0, 20),
]
</script>
```

## 3. 使用 Composables

### 3.1 useCalendar

```vue
<script setup lang="ts">
import { useCalendar } from '@ldesign/calendar-vue'

const {
  currentDate,
  selectedDate,
  viewMode,
  viewData,
  goToToday,
  nextMonth,
  prevMonth,
  selectDate,
  setViewMode,
} = useCalendar({
  defaultDate: new Date(),
  viewMode: 'month',
  showLunar: true,
})

// 使用方法
const handleNext = () => {
  nextMonth()
}
</script>
```

### 3.2 useEvents

```vue
<script setup lang="ts">
import { useEvents } from '@ldesign/calendar-vue'
import type { CalendarEvent } from '@ldesign/calendar-core'

const {
  events,
  addEvent,
  updateEvent,
  removeEvent,
  getEventsOnDate,
} = useEvents()

// 添加事件
const handleAddEvent = () => {
  addEvent({
    id: Date.now().toString(),
    title: '新事件',
    start: new Date(),
    end: new Date(),
    allDay: true,
  })
}

// 获取某天的事件
const todayEvents = getEventsOnDate(new Date())
</script>
```

## 4. 主题定制

### 4.1 使用预设主题

```vue
<template>
  <Calendar theme="dark" />
</template>
```

### 4.2 自定义主题变量

```vue
<script setup lang="ts">
import { useTheme } from '@ldesign/calendar-vue'

const { applyThemeVariables } = useTheme()

applyThemeVariables({
  primaryColor: '#1890ff',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
})
</script>
```

### 4.3 CSS 变量定制

```css
:root {
  --calendar-primary-color: #1890ff;
  --calendar-background-color: #ffffff;
  --calendar-text-color: #333333;
  --calendar-border-color: #e8e8e8;
  --calendar-hover-color: #f5f5f5;
  --calendar-selected-color: #1890ff;
  --calendar-today-color: #ff4d4f;
  --calendar-cell-width: 40px;
  --calendar-cell-height: 40px;
  --calendar-border-radius: 4px;
}
```

## 5. 国际化

```vue
<script setup lang="ts">
import { Calendar } from '@ldesign/calendar-vue'

// 使用不同语言
</script>

<template>
  <!-- 简体中文 -->
  <Calendar locale="zh-CN" />
  
  <!-- 繁体中文 -->
  <Calendar locale="zh-TW" />
  
  <!-- 英语 -->
  <Calendar locale="en-US" />
  
  <!-- 日语 -->
  <Calendar locale="ja-JP" />
</template>
```

## 6. 事件管理完整示例

```vue
<template>
  <div class="calendar-app">
    <Calendar
      v-model="selectedDate"
      :events="events"
      @date-click="handleDateClick"
      @event-click="handleEventClick"
    />
    
    <EventPanel
      :events="selectedDateEvents"
      @add="handleAddEvent"
      @edit="handleEditEvent"
      @delete="handleDeleteEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calendar, EventPanel } from '@ldesign/calendar-vue'
import { useEvents } from '@ldesign/calendar-vue'
import type { CalendarEvent } from '@ldesign/calendar-core'

const selectedDate = ref<Date>(new Date())
const { events, addEvent, updateEvent, removeEvent, getEventsOnDate } = useEvents()

const selectedDateEvents = computed(() => 
  selectedDate.value ? getEventsOnDate(selectedDate.value) : []
)

const handleDateClick = (date: Date) => {
  selectedDate.value = date
}

const handleEventClick = (event: CalendarEvent) => {
  console.log('编辑事件:', event)
}

const handleAddEvent = (event: CalendarEvent) => {
  addEvent(event)
}

const handleEditEvent = (id: string, event: Partial<CalendarEvent>) => {
  updateEvent(id, event)
}

const handleDeleteEvent = (id: string) => {
  removeEvent(id)
}
</script>
```

## 7. 性能优化示例

### 7.1 大量事件处理

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCalendar, useEvents } from '@ldesign/calendar-vue'

const { viewData } = useCalendar()
const { getEventsInRange } = useEvents()

// 只加载当前视图范围内的事件
const visibleEvents = computed(() => {
  if (viewData.value) {
    const start = viewData.value.weeks[0].days[0].date
    const lastWeek = viewData.value.weeks[viewData.value.weeks.length - 1]
    const end = lastWeek.days[lastWeek.days.length - 1].date
    return getEventsInRange(start, end)
  }
  return []
})
</script>
```

## 8. 导入导出功能

```vue
<script setup lang="ts">
import { useEvents } from '@ldesign/calendar-vue'

const { eventManager } = useEvents()

// 导出为 ICS
const exportToICS = () => {
  const icsData = eventManager.exportToICS()
  // 下载文件逻辑
  const blob = new Blob([icsData], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'calendar.ics'
  a.click()
}

// 导入 ICS
const importFromICS = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const icsData = e.target?.result as string
    eventManager.importFromICS(icsData)
  }
  reader.readAsText(file)
}
</script>