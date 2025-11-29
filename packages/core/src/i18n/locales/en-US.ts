/**
 * English (US) language pack
 */

import type { I18nMessages } from '../../types';

export const enUS: I18nMessages = {
  // Weekdays
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],

  // Months
  months: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  monthsShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ],

  // Buttons
  today: 'Today',
  clear: 'Clear',
  confirm: 'Confirm',
  cancel: 'Cancel',

  // Views
  year: 'Year',
  month: 'Month',
  week: 'Week',
  day: 'Day',

  // Others
  selectDate: 'Select Date',
  selectTime: 'Select Time',
  startDate: 'Start Date',
  endDate: 'End Date',
  startTime: 'Start Time',
  endTime: 'End Time',
  
  // Events
  event: 'Event',
  events: 'Events',
  allDay: 'All Day',
  createEvent: 'Create Event',
  editEvent: 'Edit Event',
  deleteEvent: 'Delete Event',
  eventTitle: 'Event Title',
  eventDescription: 'Event Description',
  
  // Repeat
  repeat: 'Repeat',
  repeatDaily: 'Daily',
  repeatWeekly: 'Weekly',
  repeatMonthly: 'Monthly',
  repeatYearly: 'Yearly',
  repeatCustom: 'Custom',
  
  // Reminder
  reminder: 'Reminder',
  noReminder: 'No Reminder',
  atTimeOfEvent: 'At time of event',
  minutesBefore: '{0} minutes before',
  hoursBefore: '{0} hours before',
  daysBefore: '{0} days before',
  
  // Error messages
  invalidDate: 'Invalid date',
  invalidTime: 'Invalid time',
  invalidRange: 'Invalid date range',
  startMustBeforeEnd: 'Start date must be before end date',
  
  // Format
  dateFormat: 'MM/DD/YYYY',
  timeFormat: 'HH:mm',
  dateTimeFormat: 'MM/DD/YYYY HH:mm',
};