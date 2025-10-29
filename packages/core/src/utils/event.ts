/**
 * @ldesign/calendar-core - Event utility functions
 */

import type { CalendarEvent, EventLayout } from '../types';
import { minutesBetween } from './date';

/**
 * Generate unique ID
 */
let idCounter = 0;
export function generateId(prefix: string = 'event'): string {
  return `${prefix}_${Date.now()}_${++idCounter}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if two events overlap
 */
export function hasOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
  return event1.start < event2.end && event1.end > event2.start;
}

/**
 * Sort events by start time, then by duration (longer first)
 */
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    if (a.start.getTime() !== b.start.getTime()) {
      return a.start.getTime() - b.start.getTime();
    }
    const durationA = a.end.getTime() - a.start.getTime();
    const durationB = b.end.getTime() - b.start.getTime();
    return durationB - durationA;
  });
}

/**
 * Group overlapping events into columns
 */
export function groupOverlappingEvents(events: CalendarEvent[]): CalendarEvent[][] {
  const sorted = sortEvents(events);
  const columns: CalendarEvent[][] = [];

  for (const event of sorted) {
    let placed = false;

    for (const column of columns) {
      const hasCollision = column.some(e => hasOverlap(e, event));
      if (!hasCollision) {
        column.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([event]);
    }
  }

  return columns;
}

/**
 * Calculate event layout for display
 */
export function calculateEventLayout(events: CalendarEvent[]): EventLayout[] {
  const sorted = sortEvents(events);
  const columns = groupOverlappingEvents(events);

  const layouts: EventLayout[] = [];
  const eventColumnMap = new Map<string, number>();

  columns.forEach((column, colIndex) => {
    column.forEach(event => {
      eventColumnMap.set(event.id, colIndex);
    });
  });

  for (const event of sorted) {
    const colIndex = eventColumnMap.get(event.id)!;

    // Calculate max columns for overlapping events
    let maxColumns = 1;
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].some(e => hasOverlap(e, event))) {
        maxColumns = Math.max(maxColumns, i + 1);
      }
    }

    layouts.push({
      event,
      left: (colIndex / maxColumns) * 100,
      width: (1 / maxColumns) * 100,
      columnIndex: colIndex,
      totalColumns: maxColumns,
    });
  }

  return layouts;
}

/**
 * Get event display text
 */
export function getEventDisplayText(event: CalendarEvent, maxLength?: number): string {
  const text = event.title || '(Untitled)';
  if (maxLength && text.length > maxLength) {
    return text.substring(0, maxLength - 3) + '...';
  }
  return text;
}

/**
 * Calculate event duration in minutes
 */
export function getEventDuration(event: CalendarEvent): number {
  return minutesBetween(event.start, event.end);
}

/**
 * Check if event is all day
 */
export function isAllDayEvent(event: CalendarEvent): boolean {
  if (event.allDay) return true;

  const start = event.start;
  const end = event.end;

  return (
    start.getHours() === 0 &&
    start.getMinutes() === 0 &&
    end.getHours() === 23 &&
    end.getMinutes() === 59
  );
}

/**
 * Validate calendar event
 */
export function validateEvent(event: Partial<CalendarEvent>): string[] {
  const errors: string[] = [];

  if (!event.title || event.title.trim() === '') {
    errors.push('Event title is required');
  }

  if (!event.start) {
    errors.push('Event start time is required');
  }

  if (!event.end) {
    errors.push('Event end time is required');
  }

  if (event.start && event.end && event.start >= event.end) {
    errors.push('Event start time must be before end time');
  }

  return errors;
}

/**
 * Clone event
 */
export function cloneEvent(event: CalendarEvent): CalendarEvent {
  return {
    ...event,
    id: generateId('event'),
    start: new Date(event.start),
    end: new Date(event.end),
    extendedProps: event.extendedProps ? { ...event.extendedProps } : undefined,
  };
}

/**
 * Check if event spans multiple days
 */
export function isMultiDayEvent(event: CalendarEvent): boolean {
  const startDay = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
  const endDay = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());
  return endDay.getTime() > startDay.getTime();
}

/**
 * Split multi-day event into daily segments
 */
export function splitMultiDayEvent(event: CalendarEvent): CalendarEvent[] {
  if (!isMultiDayEvent(event)) {
    return [event];
  }

  const segments: CalendarEvent[] = [];
  const current = new Date(event.start);
  const end = new Date(event.end);

  while (current < end) {
    const dayEnd = new Date(current);
    dayEnd.setHours(23, 59, 59, 999);

    segments.push({
      ...event,
      id: `${event.id}_${segments.length}`,
      start: new Date(current),
      end: dayEnd < end ? dayEnd : new Date(end),
      extendedProps: {
        ...event.extendedProps,
        _isSegment: true,
        _segmentIndex: segments.length,
        _originalId: event.id,
      },
    });

    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }

  return segments;
}

/**
 * Filter events by date range
 */
export function filterEventsByDateRange(
  events: CalendarEvent[],
  start: Date,
  end: Date
): CalendarEvent[] {
  return events.filter(event => {
    return event.start < end && event.end > start;
  });
}

/**
 * Get events for specific date
 */
export function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return filterEventsByDateRange(events, dayStart, dayEnd);
}

/**
 * Merge overlapping events (for display optimization)
 */
export function mergeOverlappingEvents(events: CalendarEvent[]): CalendarEvent[] {
  if (events.length === 0) return [];

  const sorted = sortEvents(events);
  const merged: CalendarEvent[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (hasOverlap(last, current)) {
      last.end = new Date(Math.max(last.end.getTime(), current.end.getTime()));
      last.title = `${last.title} + ${current.title}`;
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}
