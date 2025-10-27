<template>
  <div class="app">
    <div class="header">
      <h1>📅 @ldesign/calendar</h1>
      <p>Vue3 Example</p>
    </div>

    <div class="toolbar">
      <button @click="prev">⬅ 上一个</button>
      <button @click="today">今天</button>
      <button @click="next">下一个 ➡</button>

      <div class="spacer"></div>

      <button @click="changeView('month')" :class="{ active: currentView === 'month' }">
        月视图
      </button>
      <button @click="changeView('week')" :class="{ active: currentView === 'week' }">周视图</button>
      <button @click="changeView('day')" :class="{ active: currentView === 'day' }">日视图</button>

      <button @click="showAddModal" class="primary">➕ 添加事件</button>
    </div>

    <div class="stats">
      <div class="stat-item">
        <div class="stat-value">{{ events.length }}</div>
        <div class="stat-label">总事件</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ upcomingCount }}</div>
        <div class="stat-label">即将到来</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ pastCount }}</div>
        <div class="stat-label">已过期</div>
      </div>
    </div>

    <div class="calendar-container">
      <LCalendar
        ref="calendarRef"
        :config="calendarConfig"
        @event-click="handleEventClick"
        @date-select="handleDateSelect"
      />
    </div>

    <!-- 添加事件模态框 -->
    <div v-if="showModal" class="modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">{{ editingEvent ? '编辑事件' : '添加事件' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>标题</label>
            <input v-model="formData.title" type="text" required />
          </div>
          <div class="form-group">
            <label>开始时间</label>
            <input v-model="formData.start" type="datetime-local" required />
          </div>
          <div class="form-group">
            <label>结束时间</label>
            <input v-model="formData.end" type="datetime-local" required />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="formData.description"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal">取消</button>
            <button type="submit" class="primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { LCalendar, useCalendar } from '@ldesign/calendar-vue';
import type { CalendarEvent } from '@ldesign/calendar-core';

// 使用 Composable API
const {
  events,
  currentView,
  currentDate,
  changeView,
  next,
  prev,
  today,
  addEvent,
  updateEvent,
  deleteEvent,
} = useCalendar({
  initialView: 'month',
  editable: true,
  selectable: true,
  firstDayOfWeek: 1,
});

// 日历配置
const calendarConfig = {
  initialView: 'month' as const,
  editable: true,
  selectable: true,
  firstDayOfWeek: 1 as const,
};

// 引用
const calendarRef = ref();
const showModal = ref(false);
const editingEvent = ref<CalendarEvent | null>(null);

// 表单数据
const formData = ref({
  title: '',
  start: '',
  end: '',
  description: '',
});

// 统计数据
const upcomingCount = computed(() => {
  const now = new Date();
  return events.value.filter((e) => e.start > now).length;
});

const pastCount = computed(() => {
  const now = new Date();
  return events.value.filter((e) => e.end < now).length;
});

// 事件处理
const handleEventClick = (event: CalendarEvent) => {
  if (
    confirm(
      `事件: ${event.title}\n开始: ${event.start.toLocaleString()}\n结束: ${event.end.toLocaleString()}\n\n是否删除？`
    )
  ) {
    deleteEvent(event.id);
  }
};

const handleDateSelect = (start: Date, end: Date) => {
  showAddModal(start, end);
};

const showAddModal = (start?: Date, end?: Date) => {
  const now = new Date();
  const defaultStart = start || now;
  const defaultEnd = end || new Date(now.getTime() + 60 * 60 * 1000);

  formData.value = {
    title: '',
    start: defaultStart.toISOString().slice(0, 16),
    end: defaultEnd.toISOString().slice(0, 16),
    description: '',
  };

  editingEvent.value = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSubmit = async () => {
  const colors = ['#3788d8', '#ff6b6b', '#51cf66', '#ffd43b', '#a78bfa'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  try {
    await addEvent({
      title: formData.value.title,
      start: new Date(formData.value.start),
      end: new Date(formData.value.end),
      description: formData.value.description,
      color,
    });

    closeModal();
  } catch (error) {
    alert('添加事件失败: ' + (error as Error).message);
  }
};

// 添加示例事件
onMounted(async () => {
  const today = new Date();
  const sampleEvents = [
    {
      title: '团队会议',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
      color: '#3788d8',
    },
    {
      title: '午餐约会',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
      color: '#ff6b6b',
    },
    {
      title: '代码评审',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 30),
      color: '#51cf66',
    },
  ];

  for (const event of sampleEvents) {
    try {
      await addEvent(event);
    } catch (error) {
      console.error('Failed to add sample event:', error);
    }
  }
});
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
}

.header h1 {
  font-size: 36px;
  margin-bottom: 10px;
}

.header p {
  opacity: 0.9;
}

.toolbar {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.toolbar button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.toolbar button:hover,
.toolbar button.active {
  border-color: #667eea;
  color: #667eea;
}

.toolbar button.primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.toolbar button.primary:hover {
  background: #5568d3;
}

.toolbar .spacer {
  flex: 1;
}

.stats {
  padding: 20px;
  background: white;
  display: flex;
  gap: 20px;
  justify-content: space-around;
  border-bottom: 1px solid #e8e8e8;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.calendar-container {
  background: white;
  padding: 20px;
  min-height: 600px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
}

.modal-title {
  font-size: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>

