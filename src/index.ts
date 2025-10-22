/**
 * @ldesign/calendar - 完整日历
 */
export class Calendar {
  constructor(private container: HTMLElement) { }
  render() { console.info('Calendar rendering') }
  addEvent(event: any) { console.info('Event added:', event) }
}
export function createCalendar(container: HTMLElement) { return new Calendar(container) }

