<template>
  <div class="demo-section">
    <h2>💚 Vue 3 示例</h2>
    <p class="desc">使用 Vue 3 Composition API</p>

    <div class="code-section">
      <h3>代码示例</h3>
      <pre><code>{{ codeExample }}</code></pre>
    </div>

    <div class="controls">
      <button @click="addEvent" class="btn btn-primary">
        ➕ 添加事件
      </button>
      <button @click="today" class="btn">📍 今天</button>
      <button @click="prev" class="btn">◀ 上一个</button>
      <button @click="next" class="btn">下一个 ▶</button>
      <select v-model="selectedView" @change="changeView" class="select">
        <option value="month">月视图</option>
        <option value="week">周视图</option>
        <option value="day">日视图</option>
        <option value="agenda">议程视图</option>
      </select>
    </div>

    <div ref="calendarRef" class="calendar-wrapper"></div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">{{ events.length }}</div>
        <div class="stat-label">总事件</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ currentView }}</div>
        <div class="stat-label">当前视图</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ formatDate(currentDate) }}</div>
        <div class="stat-label">当前日期</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCalendar } from '@ldesign/calendar/src/adapters/vue/composables/useCalendar';
import type { CalendarView } from '@ldesign/calendar';
import '@ldesign/calendar/src/styles/calendar.css';

const selectedView = ref<CalendarView>('month');

const {
  calendarRef,
  events,
  currentView,
  currentDate,
  addEvent: addEventFn,
  changeView: changeViewFn,
  next: nextFn,
  prev: prevFn,
  today: todayFn,
} = useCalendar({
  initialView: 'month',
  editable: true,
  selectable: true,
  height: 600,
});

const codeExample = `<script setup>
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
  initialView: 'month',
  editable: true,
});
<\/script>

<template>
  <div ref="calendarRef"></div>
  <p>事件数: {{ events.length }}</p>
</template>`;

const addEvent = async () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 14, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 15, 30);

  await addEventFn({
    title: '产品评审',
    start,
    end,
    color: '#52c41a',
    description: 'Q1 产品路线图评审',
  });
};

const changeView = () => {
  changeViewFn(selectedView.value);
};

const next = () => nextFn();
const prev = () => prevFn();
const today = () => todayFn();

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};
</script>

<style scoped>
.demo-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h2 {
  color: #262626;
  margin: 0;
}

.desc {
  color: #8c8c8c;
  margin: 0;
}

.code-section {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
}

.code-section h3 {
  margin: 0 0 10px 0;
  color: #595959;
  font-size: 14px;
}

pre {
  margin: 0;
  overflow-x: auto;
}

code {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #262626;
}

.controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn:hover {
  color: #40a9ff;
  border-color: #40a9ff;
}

.btn-primary {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

.select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.calendar-wrapper {
  min-height: 600px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 8px;
  color: white;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}
</style>
