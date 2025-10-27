/**
 * Vanilla JS Calendar Example
 */

import { createCalendar } from '@ldesign/calendar-core';
import type { CalendarEvent } from '@ldesign/calendar-core';

// 创建日历实例
const calendar = createCalendar({
  initialView: 'month',
  initialDate: new Date(),
  editable: true,
  selectable: true,
  firstDayOfWeek: 1, // 周一开始
  callbacks: {
    onEventClick: (event) => {
      alert(`事件: ${event.title}\n开始: ${event.start.toLocaleString()}\n结束: ${event.end.toLocaleString()}`);
    },
    onDateSelect: (start, end) => {
      openEventModal(start, end);
    },
    onDateClick: (date) => {
      console.log('点击日期:', date);
    },
    onViewChange: (view, date) => {
      console.log('视图改变:', view, date);
    },
  },
});

// 更新统计信息
function updateStats() {
  const events = calendar.getEvents();
  const now = new Date();
  
  const upcoming = events.filter(e => e.start > now).length;
  const past = events.filter(e => e.end < now).length;
  
  document.getElementById('stat-total')!.textContent = events.length.toString();
  document.getElementById('stat-upcoming')!.textContent = upcoming.toString();
  document.getElementById('stat-past')!.textContent = past.toString();
}

// 监听渲染事件
calendar.on('render', () => {
  updateStats();
});

// 工具栏按钮
document.getElementById('btn-prev')?.addEventListener('click', () => {
  calendar.prev();
});

document.getElementById('btn-today')?.addEventListener('click', () => {
  calendar.today();
});

document.getElementById('btn-next')?.addEventListener('click', () => {
  calendar.next();
});

document.getElementById('btn-month')?.addEventListener('click', () => {
  calendar.changeView('month');
});

document.getElementById('btn-week')?.addEventListener('click', () => {
  calendar.changeView('week');
});

document.getElementById('btn-day')?.addEventListener('click', () => {
  calendar.changeView('day');
});

document.getElementById('btn-add-event')?.addEventListener('click', () => {
  openEventModal();
});

// 事件模态框
const modal = document.getElementById('event-modal')!;
const form = document.getElementById('event-form') as HTMLFormElement;
const btnCancel = document.getElementById('btn-cancel')!;

function openEventModal(start?: Date, end?: Date) {
  const now = new Date();
  const defaultStart = start || now;
  const defaultEnd = end || new Date(now.getTime() + 60 * 60 * 1000); // 1小时后

  // 设置默认值
  (document.getElementById('event-start') as HTMLInputElement).value = 
    defaultStart.toISOString().slice(0, 16);
  (document.getElementById('event-end') as HTMLInputElement).value = 
    defaultEnd.toISOString().slice(0, 16);

  modal.classList.add('active');
}

function closeEventModal() {
  modal.classList.remove('active');
  form.reset();
}

btnCancel.addEventListener('click', closeEventModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeEventModal();
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = (document.getElementById('event-title') as HTMLInputElement).value;
  const start = new Date((document.getElementById('event-start') as HTMLInputElement).value);
  const end = new Date((document.getElementById('event-end') as HTMLInputElement).value);
  const description = (document.getElementById('event-description') as HTMLTextAreaElement).value;

  const colors = ['#3788d8', '#ff6b6b', '#51cf66', '#ffd43b', '#a78bfa'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  try {
    await calendar.addEvent({
      title,
      start,
      end,
      description,
      color,
    });

    closeEventModal();
    updateStats();
  } catch (error) {
    alert('添加事件失败: ' + (error as Error).message);
  }
});

// 添加一些示例事件
const today = new Date();
const sampleEvents: Omit<CalendarEvent, 'id'>[] = [
  {
    title: '团队会议',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
    color: '#3788d8',
    description: '讨论项目进展',
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
  {
    title: '产品演示',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 15, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 16, 0),
    color: '#ffd43b',
  },
];

// 异步添加示例事件
(async () => {
  for (const event of sampleEvents) {
    try {
      await calendar.addEvent(event);
    } catch (error) {
      console.error('Failed to add sample event:', error);
    }
  }
  updateStats();
})();

// 初始更新
updateStats();

console.log('📅 Calendar initialized!');
console.log('Calendar instance:', calendar);

