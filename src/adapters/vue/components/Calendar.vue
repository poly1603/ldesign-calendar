<template>
  <div ref="calendarRef" class="ldesign-calendar-wrapper"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { Calendar } from '../../../core/calendar';
import type { CalendarConfig, CalendarEvent, CalendarView } from '../../../types';

// Props
const props = withDefaults(defineProps<{
  config?: CalendarConfig;
  events?: CalendarEvent[];
}>(), {
  config: () => ({}),
  events: () => [],
});

// Emits
const emit = defineEmits<{
  eventClick: [event: CalendarEvent];
  eventCreate: [event: CalendarEvent];
  eventUpdate: [event: CalendarEvent, oldEvent: CalendarEvent];
  eventDelete: [id: string];
  dateSelect: [start: Date, end: Date];
  dateClick: [date: Date];
  viewChange: [view: CalendarView, date: Date];
  eventDragStart: [event: CalendarEvent];
  eventDragEnd: [event: CalendarEvent];
  eventResizeStart: [event: CalendarEvent];
  eventResizeEnd: [event: CalendarEvent];
}>();

// Refs
const calendarRef = ref<HTMLElement>();
let calendar: Calendar | null = null;

// 初始化
onMounted(() => {
  if (!calendarRef.value) return;

  // 创建日历实例
  calendar = new Calendar(calendarRef.value, props.config);

  // 绑定事件
  calendar.on('eventClick', (event: CalendarEvent) => emit('eventClick', event));
  calendar.on('eventCreate', (event: CalendarEvent) => emit('eventCreate', event));
  calendar.on('eventUpdate', (event: CalendarEvent, oldEvent: CalendarEvent) =>
    emit('eventUpdate', event, oldEvent)
  );
  calendar.on('eventDelete', (id: string) => emit('eventDelete', id));
  calendar.on('dateSelect', (start: Date, end: Date) => emit('dateSelect', start, end));
  calendar.on('dateClick', (date: Date) => emit('dateClick', date));
  calendar.on('viewChange', (view: CalendarView, date: Date) =>
    emit('viewChange', view, date)
  );
  calendar.on('eventDragStart', (event: CalendarEvent) => emit('eventDragStart', event));
  calendar.on('eventDragEnd', (event: CalendarEvent) => emit('eventDragEnd', event));
  calendar.on('eventResizeStart', (event: CalendarEvent) =>
    emit('eventResizeStart', event)
  );
  calendar.on('eventResizeEnd', (event: CalendarEvent) => emit('eventResizeEnd', event));

  // 添加初始事件
  if (props.events && props.events.length > 0) {
    props.events.forEach(event => {
      calendar?.addEvent(event);
    });
  }
});

// 监听事件变化
watch(
  () => props.events,
  (newEvents) => {
    if (calendar && newEvents) {
      // TODO: 智能更新事件（diff算法）
      calendar.render();
    }
  },
  { deep: true }
);

// 清理
onBeforeUnmount(() => {
  if (calendar) {
    calendar.destroy();
    calendar = null;
  }
});

// 暴露方法给父组件
defineExpose({
  getCalendar: () => calendar,
  addEvent: (event: Omit<CalendarEvent, 'id'>) => calendar?.addEvent(event),
  updateEvent: (id: string, updates: Partial<CalendarEvent>) =>
    calendar?.updateEvent(id, updates),
  deleteEvent: (id: string) => calendar?.deleteEvent(id),
  getEvents: (start?: Date, end?: Date) => calendar?.getEvents(start, end),
  changeView: (view: CalendarView) => calendar?.changeView(view),
  next: () => calendar?.next(),
  prev: () => calendar?.prev(),
  today: () => calendar?.today(),
  gotoDate: (date: Date) => calendar?.gotoDate(date),
});
</script>

<style>
.ldesign-calendar-wrapper {
  width: 100%;
  height: 100%;
}
</style>
