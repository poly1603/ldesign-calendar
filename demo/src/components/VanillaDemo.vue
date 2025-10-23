<template>
  <div class="demo-section">
    <h2>🍦 Vanilla JavaScript 示例</h2>
    <p class="desc">使用纯 JavaScript 创建日历，无需任何框架</p>

    <div class="code-section">
      <h3>代码示例</h3>
      <pre><code>{{ codeExample }}</code></pre>
    </div>

    <div class="controls">
      <button @click="addSampleEvent" class="btn btn-primary">
        ➕ 添加示例事件
      </button>
      <button @click="calendar?.today()" class="btn">
        📍 今天
      </button>
      <button @click="calendar?.prev()" class="btn">
        ◀ 上一个
      </button>
      <button @click="calendar?.next()" class="btn">
        下一个 ▶
      </button>
    </div>

    <div ref="calendarContainer" class="calendar-wrapper"></div>

    <div class="event-list">
      <h3>事件列表 ({{ events.length }})</h3>
      <div v-if="events.length === 0" class="empty">
        暂无事件，点击日期创建事件
      </div>
      <div v-else class="events">
        <div v-for="event in events" :key="event.id" class="event-item" :style="{ borderLeftColor: event.color }">
          <div class="event-title">{{ event.title }}</div>
          <div class="event-time">
            {{ formatDateTime(event.start) }} - {{ formatDateTime(event.end) }}
          </div>
          <button @click="deleteEvent(event.id)" class="btn-delete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { createCalendar } from '@ldesign/calendar';
import type { Calendar, CalendarEvent } from '@ldesign/calendar';
import '@ldesign/calendar/src/styles/calendar.css';

const calendarContainer = ref<HTMLElement>();
let calendar: Calendar | null = null;
const events = ref<CalendarEvent[]>([]);

const codeExample = `import { createCalendar } from '@ldesign/calendar';

const calendar = createCalendar('#calendar', {
  initialView: 'month',
  editable: true,
  selectable: true,
  callbacks: {
    onEventClick: (event) => {
      console.log('点击事件:', event);
    },
    onDateSelect: (start, end) => {
      const title = prompt('请输入事件标题:');
      if (title) {
        calendar.addEvent({ title, start, end });
      }
    },
  },
});`;

onMounted(() => {
  if (!calendarContainer.value) return;

  calendar = createCalendar(calendarContainer.value, {
    initialView: 'month',
    editable: true,
    selectable: true,
    height: 600,
    callbacks: {
      onEventClick: (event: CalendarEvent) => {
        alert(`事件: ${event.title}\n时间: ${formatDateTime(event.start)}`);
      },
      onDateSelect: (start: Date, end: Date) => {
        const title = prompt('请输入事件标题:');
        if (title) {
          calendar?.addEvent({
            title,
            start,
            end,
            color: getRandomColor(),
          });
          updateEvents();
        }
      },
    },
  });

  updateEvents();
});

onBeforeUnmount(() => {
  calendar?.destroy();
});

const updateEvents = () => {
  if (calendar) {
    events.value = calendar.getEvents();
  }
};

const addSampleEvent = async () => {
  if (!calendar) return;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 10, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 11, 30);

  await calendar.addEvent({
    title: '团队会议',
    start,
    end,
    color: '#1890ff',
    description: '讨论项目进展',
  });

  updateEvents();
};

const deleteEvent = async (id: string) => {
  if (!calendar) return;
  if (confirm('确定要删除这个事件吗？')) {
    await calendar.deleteEvent(id);
    updateEvents();
  }
};

const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getRandomColor = (): string => {
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
  return colors[Math.floor(Math.random() * colors.length)];
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
  color: white;
}

.calendar-wrapper {
  min-height: 600px;
}

.event-list {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.event-list h3 {
  margin: 0 0 15px 0;
  color: #262626;
}

.empty {
  text-align: center;
  color: #8c8c8c;
  padding: 40px;
}

.events {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-left: 4px solid;
  background: #fafafa;
  border-radius: 4px;
  transition: transform 0.2s;
}

.event-item:hover {
  transform: translateX(4px);
}

.event-title {
  font-weight: 500;
  color: #262626;
}

.event-time {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}

.btn-delete {
  padding: 4px 12px;
  border: 1px solid #ff4d4f;
  border-radius: 4px;
  background: white;
  color: #ff4d4f;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-delete:hover {
  background: #ff4d4f;
  color: white;
}
</style>
