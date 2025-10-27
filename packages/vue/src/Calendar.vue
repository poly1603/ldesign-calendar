<template>
  <div ref="containerRef" class="ldesign-calendar-vue"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { Calendar as CalendarCore, CalendarConfig, CalendarEvent } from '@ldesign/calendar-core';
import { createCalendar } from '@ldesign/calendar-core';

/**
 * Props
 */
const props = withDefaults(
  defineProps<{
    config?: CalendarConfig;
  }>(),
  {
    config: () => ({}),
  }
);

/**
 * Emits
 */
const emit = defineEmits<{
  eventClick: [event: CalendarEvent];
  eventCreate: [event: CalendarEvent];
  eventUpdate: [event: CalendarEvent, oldEvent: CalendarEvent];
  eventDelete: [eventId: string];
  dateSelect: [start: Date, end: Date];
  dateClick: [date: Date];
  viewChange: [view: string, date: Date];
  render: [data: any];
}>();

/**
 * Refs
 */
const containerRef = ref<HTMLElement>();
let calendarInstance: CalendarCore | null = null;

/**
 * 初始化日历
 */
const initCalendar = () => {
  if (!containerRef.value) return;

  // 合并配置和事件回调
  const config: CalendarConfig = {
    ...props.config,
    callbacks: {
      ...props.config.callbacks,
      onEventClick: (event) => {
        emit('eventClick', event);
        props.config.callbacks?.onEventClick?.(event);
      },
      onEventCreate: (event) => {
        emit('eventCreate', event);
        return props.config.callbacks?.onEventCreate?.(event);
      },
      onEventUpdate: (event, oldEvent) => {
        emit('eventUpdate', event, oldEvent);
        return props.config.callbacks?.onEventUpdate?.(event, oldEvent);
      },
      onEventDelete: (eventId) => {
        emit('eventDelete', eventId);
        return props.config.callbacks?.onEventDelete?.(eventId);
      },
      onDateSelect: (start, end) => {
        emit('dateSelect', start, end);
        props.config.callbacks?.onDateSelect?.(start, end);
      },
      onDateClick: (date) => {
        emit('dateClick', date);
        props.config.callbacks?.onDateClick?.(date);
      },
      onViewChange: (view, date) => {
        emit('viewChange', view, date);
        props.config.callbacks?.onViewChange?.(view, date);
      },
    },
  };

  calendarInstance = createCalendar(config);

  // 监听渲染事件
  calendarInstance.on('render', (data) => {
    emit('render', data);
  });
};

/**
 * 暴露实例方法
 */
defineExpose({
  getInstance: () => calendarInstance,
  changeView: (view: string) => calendarInstance?.changeView(view as any),
  next: () => calendarInstance?.next(),
  prev: () => calendarInstance?.prev(),
  today: () => calendarInstance?.today(),
  gotoDate: (date: Date) => calendarInstance?.gotoDate(date),
  addEvent: (event: Omit<CalendarEvent, 'id'>) => calendarInstance?.addEvent(event),
  updateEvent: (id: string, updates: Partial<CalendarEvent>) =>
    calendarInstance?.updateEvent(id, updates),
  deleteEvent: (id: string) => calendarInstance?.deleteEvent(id),
  getEvents: (start?: Date, end?: Date) => calendarInstance?.getEvents(start, end),
  getEvent: (id: string) => calendarInstance?.getEvent(id),
  getCurrentView: () => calendarInstance?.getCurrentView(),
  getCurrentDate: () => calendarInstance?.getCurrentDate(),
  render: () => calendarInstance?.render(),
});

/**
 * 生命周期
 */
onMounted(() => {
  initCalendar();
});

onUnmounted(() => {
  calendarInstance?.destroy();
});

/**
 * 监听配置变化
 */
watch(
  () => props.config,
  (newConfig) => {
    if (calendarInstance) {
      calendarInstance.updateConfig(newConfig);
    }
  },
  { deep: true }
);
</script>

<style>
.ldesign-calendar-vue {
  width: 100%;
  height: 100%;
}
</style>

