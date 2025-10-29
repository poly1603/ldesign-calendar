/**
 * @ldesign/calendar-core - Event Manager (Optimized)
 * Adds operation queue and optimized memory usage
 */

import type { CalendarEvent, StorageAdapter, EventManagerInterface } from './types';
import { generateId, validateEvent, sortEvents, filterEventsByDateRange } from './utils/event';
import { EventEmitter } from './utils/event-emitter';

/**
 * Local Storage Adapter (default)
 */
class LocalStorageAdapter implements StorageAdapter {
  private storageKey = 'ldesign_calendar_events';

  async save(events: CalendarEvent[]): Promise<void> {
    try {
      const data = JSON.stringify(events.map(e => ({
        ...e,
        start: e.start.toISOString(),
        end: e.end.toISOString(),
      })));
      localStorage.setItem(this.storageKey, data);
    } catch (error) {
      console.error('Failed to save events:', error);
      throw error;
    }
  }

  async load(): Promise<CalendarEvent[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const events = JSON.parse(data);
      return events.map((e: any) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }));
    } catch (error) {
      console.error('Failed to load events:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }
}

/**
 * Event Manager
 */
export class EventManager implements EventManagerInterface {
  private events: Map<string, CalendarEvent>;
  private storageAdapter: StorageAdapter;
  private eventEmitter: EventEmitter;
  private operationLock = false; // Operation lock
  
  constructor(storageAdapter?: StorageAdapter) {
    this.events = new Map();
    this.storageAdapter = storageAdapter || new LocalStorageAdapter();
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Initialize (load events from storage)
   */
  async init(): Promise<void> {
    try {
      const events = await this.storageAdapter.load();
      this.events.clear();
      for (const event of events) {
        this.events.set(event.id, event);
      }
    } catch (error) {
      console.error('Failed to initialize EventManager:', error);
    }
  }

  /**
   * Create event (optimized: add lock mechanism)
   */
  async createEvent(event: CalendarEvent): Promise<void> {
    // Wait for lock release
    await this.waitForLock();
    this.operationLock = true;

    try {
      // Validate event
      const errors = validateEvent(event);
      if (errors.length > 0) {
        throw new Error(`Event validation failed: ${errors.join(', ')}`);
      }

      // Generate ID if not present
      if (!event.id) {
        event.id = generateId();
      }

      // Check if ID already exists
      if (this.events.has(event.id)) {
        throw new Error(`Event ID already exists: ${event.id}`);
      }

      // Save to memory
      this.events.set(event.id, event);

      // Save to storage
      try {
        if (this.storageAdapter.create) {
          await this.storageAdapter.create(event);
        } else {
          await this.storageAdapter.save(Array.from(this.events.values()));
        }
      } catch (error) {
        // Rollback memory changes
        this.events.delete(event.id);
        throw error;
      }

      // Trigger change notification
      this.notifyChange();
    } finally {
      this.operationLock = false;
    }
  }

  /**
   * Update event
   */
  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<void> {
    await this.waitForLock();
    this.operationLock = true;

    try {
      const event = this.events.get(id);

      if (!event) {
        throw new Error(`Event not found: ${id}`);
      }

      // Create updated event
      const updatedEvent: CalendarEvent = {
        ...event,
        ...updates,
        id, // Keep ID unchanged
        start: updates.start ? new Date(updates.start) : event.start,
        end: updates.end ? new Date(updates.end) : event.end,
      };

      // Validate updated event
      const errors = validateEvent(updatedEvent);
      if (errors.length > 0) {
        throw new Error(`Event validation failed: ${errors.join(', ')}`);
      }

      // Save old event (for rollback)
      const oldEvent = event;

      // Update memory
      this.events.set(id, updatedEvent);

      // Update storage
      try {
        if (this.storageAdapter.update) {
          await this.storageAdapter.update(id, updates);
        } else {
          await this.storageAdapter.save(Array.from(this.events.values()));
        }
      } catch (error) {
        // Rollback memory changes
        this.events.set(id, oldEvent);
        throw error;
      }

      // Trigger change notification
      this.notifyChange();
    } finally {
      this.operationLock = false;
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(id: string): Promise<void> {
    await this.waitForLock();
    this.operationLock = true;

    try {
      const event = this.events.get(id);

      if (!event) {
        throw new Error(`Event not found: ${id}`);
      }

      // Delete from memory
      this.events.delete(id);

      // Delete from storage
      try {
        if (this.storageAdapter.delete) {
          await this.storageAdapter.delete(id);
        } else {
          await this.storageAdapter.save(Array.from(this.events.values()));
        }
      } catch (error) {
        // Rollback memory changes
        this.events.set(id, event);
        throw error;
      }

      // Trigger change notification
      this.notifyChange();
    } finally {
      this.operationLock = false;
    }
  }

  /**
   * Get events
   */
  getEvents(start?: Date, end?: Date): CalendarEvent[] {
    let events = Array.from(this.events.values());

    // Filter by date range
    if (start && end) {
      events = filterEventsByDateRange(events, start, end);
    }

    return sortEvents(events);
  }

  /**
   * Find single event
   */
  findEvent(id: string): CalendarEvent | null {
    return this.events.get(id) || null;
  }

  /**
   * Get all events
   */
  getAllEvents(): CalendarEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * Clear all events
   */
  async clear(): Promise<void> {
    await this.waitForLock();
    this.operationLock = true;

    try {
      // Save old data (for rollback)
      const oldEvents = new Map(this.events);

      // Clear memory
      this.events.clear();

      // Clear storage
      try {
        await this.storageAdapter.clear();
      } catch (error) {
        // Rollback memory changes
        this.events = oldEvents;
        throw error;
      }

      // Trigger change notification
      this.notifyChange();
    } finally {
      this.operationLock = false;
    }
  }

  /**
   * Batch import events
   */
  async importEvents(events: CalendarEvent[]): Promise<void> {
    for (const event of events) {
      await this.createEvent(event);
    }
  }

  /**
   * Export events
   */
  exportEvents(): CalendarEvent[] {
    return this.getAllEvents();
  }

  /**
   * Search events
   */
  searchEvents(query: string): CalendarEvent[] {
    const lowerQuery = query.toLowerCase();
    const results: CalendarEvent[] = [];

    for (const event of this.events.values()) {
      if (
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description?.toLowerCase().includes(lowerQuery) ||
        event.location?.toLowerCase().includes(lowerQuery)
      ) {
        results.push(event);
      }
    }

    return sortEvents(results);
  }

  /**
   * Listen to changes
   */
  onChange(callback: () => void): () => void {
    return this.eventEmitter.on('change', callback);
  }

  /**
   * Notify changes
   */
  private notifyChange(): void {
    this.eventEmitter.emitSync('change');
  }

  /**
   * Wait for operation lock release
   */
  private async waitForLock(): Promise<void> {
    while (this.operationLock) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    upcoming: number;
    past: number;
  } {
    const now = new Date();
    let upcoming = 0;
    let past = 0;

    for (const event of this.events.values()) {
      if (event.start > now) {
        upcoming++;
      } else if (event.end < now) {
        past++;
      }
    }

    return {
      total: this.events.size,
      upcoming,
      past,
    };
  }

  /**
   * Destroy (clean up resources)
   */
  destroy(): void {
    this.events.clear();
    this.eventEmitter.destroy();
  }
}
