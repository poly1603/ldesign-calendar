/**
 * @ldesign/calendar - English language pack
 */

import type { Locale } from '../types';

const enUS: Locale = {
  code: 'en-US',
  name: 'English',
  direction: 'ltr',
  firstDayOfWeek: 0, // Sunday

  months: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],

  monthsShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ],

  weekdays: [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ],

  weekdaysShort: [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
  ],

  weekdaysMin: [
    'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'
  ],

  dateFormats: {
    short: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    full: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }
  },

  timeFormats: {
    short: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    },
    long: {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }
  },

  ui: {
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda',
    noEvents: 'No events',
    allDay: 'All day',
    createEvent: 'Create Event',
    editEvent: 'Edit Event',
    deleteEvent: 'Delete Event',
    saveEvent: 'Save',
    cancelEdit: 'Cancel',
    eventTitle: 'Title',
    eventDescription: 'Description',
    eventLocation: 'Location',
    eventStart: 'Start',
    eventEnd: 'End',
    moreEvents: '{count} more',
    loading: 'Loading...',
    error: 'Error',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousWeek: 'Previous week',
    nextWeek: 'Next week',
    previousDay: 'Previous day',
    nextDay: 'Next day'
  },

  messages: {
    confirmDelete: 'Are you sure you want to delete this event?',
    eventCreated: 'Event created successfully',
    eventUpdated: 'Event updated successfully',
    eventDeleted: 'Event deleted',
    errorSaving: 'Failed to save, please try again',
    errorDeleting: 'Failed to delete, please try again',
    errorLoading: 'Failed to load, please refresh the page',
    invalidDate: 'Invalid date',
    invalidTimeRange: 'End time must be after start time'
  },

  recurrence: {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    repeat: 'Repeat',
    every: 'Every',
    days: 'day(s)',
    weeks: 'week(s)',
    months: 'month(s)',
    years: 'year(s)',
    on: 'on',
    until: 'until',
    count: 'times',
    occurrences: 'occurrences',
    weekdays: {
      sunday: 'Sunday',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday'
    }
  }
};

export default enUS;
