/**
 * 导入导出管理器 - 支持多种格式的事件导入导出
 * @module import-export
 */

import type { CalendarEvent, RecurrenceRule } from '../types';

export interface ImportExportConfig {
  /** 默认时区 */
  defaultTimezone?: string;
  /** 是否包含私有属性 */
  includePrivateProps?: boolean;
  /** CSV 分隔符 */
  csvSeparator?: string;
  /** 日期格式 */
  dateFormat?: string;
  /** 时间格式 */
  timeFormat?: string;
}

export interface ImportResult {
  /** 成功导入的事件 */
  events: CalendarEvent[];
  /** 导入错误 */
  errors: Array<{ line?: number; message: string }>;
  /** 导入统计 */
  stats: {
    total: number;
    success: number;
    failed: number;
    skipped: number;
  };
}

export interface ExportOptions {
  /** 导出格式 */
  format: 'ical' | 'csv' | 'json';
  /** 日期范围 */
  dateRange?: { start: Date; end: Date };
  /** 事件ID列表（如果指定，只导出这些事件） */
  eventIds?: string[];
  /** 文件名 */
  filename?: string;
  /** 是否下载文件 */
  download?: boolean;
}

export class ImportExportManager {
  private config: Required<ImportExportConfig>;

  constructor(config: ImportExportConfig = {}) {
    this.config = {
      defaultTimezone: config.defaultTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      includePrivateProps: config.includePrivateProps || false,
      csvSeparator: config.csvSeparator || ',',
      dateFormat: config.dateFormat || 'YYYY-MM-DD',
      timeFormat: config.timeFormat || 'HH:mm:ss',
    };
  }

  /**
   * 导入事件
   */
  public async import(file: File | string, format?: 'ical' | 'csv' | 'json'): Promise<ImportResult> {
    const content = typeof file === 'string' ? file : await this.readFile(file);
    const detectedFormat = format || this.detectFormat(content, file instanceof File ? file.name : '');

    switch (detectedFormat) {
      case 'ical':
        return this.importICal(content);
      case 'csv':
        return this.importCSV(content);
      case 'json':
        return this.importJSON(content);
      default:
        throw new Error(`Unsupported format: ${detectedFormat}`);
    }
  }

  /**
   * 导出事件
   */
  public export(events: CalendarEvent[], options: ExportOptions): string | void {
    let content: string;

    switch (options.format) {
      case 'ical':
        content = this.exportICal(events, options);
        break;
      case 'csv':
        content = this.exportCSV(events, options);
        break;
      case 'json':
        content = this.exportJSON(events, options);
        break;
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }

    if (options.download) {
      const filename = options.filename || `calendar-export-${Date.now()}.${this.getFileExtension(options.format)}`;
      this.downloadFile(content, filename, this.getMimeType(options.format));
    }

    return content;
  }

  /**
   * 读取文件内容
   */
  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * 检测文件格式
   */
  private detectFormat(content: string, filename: string): 'ical' | 'csv' | 'json' | null {
    // 通过文件扩展名检测
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'ics' || ext === 'ical') return 'ical';
    if (ext === 'csv') return 'csv';
    if (ext === 'json') return 'json';

    // 通过内容检测
    const trimmed = content.trim();
    if (trimmed.startsWith('BEGIN:VCALENDAR')) return 'ical';
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
    if (trimmed.includes(',') || trimmed.includes('\t')) return 'csv';

    return null;
  }

  /**
   * 导入 iCal 格式
   */
  private importICal(content: string): ImportResult {
    const result: ImportResult = {
      events: [],
      errors: [],
      stats: { total: 0, success: 0, failed: 0, skipped: 0 },
    };

    try {
      const lines = content.split(/\r?\n/);
      let currentEvent: Partial<CalendarEvent> | null = null;
      let lineNumber = 0;

      for (const line of lines) {
        lineNumber++;
        const trimmedLine = line.trim();

        if (trimmedLine === 'BEGIN:VEVENT') {
          currentEvent = { extendedProps: {} };
          result.stats.total++;
        } else if (trimmedLine === 'END:VEVENT' && currentEvent) {
          try {
            const event = this.validateEvent(currentEvent);
            result.events.push(event);
            result.stats.success++;
          } catch (error) {
            result.errors.push({
              line: lineNumber,
              message: error instanceof Error ? error.message : 'Invalid event',
            });
            result.stats.failed++;
          }
          currentEvent = null;
        } else if (currentEvent) {
          this.parseICalProperty(trimmedLine, currentEvent);
        }
      }
    } catch (error) {
      result.errors.push({
        message: error instanceof Error ? error.message : 'Failed to parse iCal',
      });
    }

    return result;
  }

  /**
   * 解析 iCal 属性
   */
  private parseICalProperty(line: string, event: Partial<CalendarEvent>): void {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const property = line.substring(0, colonIndex);
    const value = line.substring(colonIndex + 1);

    // 处理带参数的属性
    const [propName, ...params] = property.split(';');

    switch (propName) {
      case 'UID':
        event.id = value;
        break;
      case 'SUMMARY':
        event.title = this.unescapeICalText(value);
        break;
      case 'DESCRIPTION':
        event.description = this.unescapeICalText(value);
        break;
      case 'LOCATION':
        event.location = this.unescapeICalText(value);
        break;
      case 'DTSTART':
        event.start = this.parseICalDate(value, params);
        break;
      case 'DTEND':
        event.end = this.parseICalDate(value, params);
        break;
      case 'RRULE':
        event.recurrence = this.parseRRule(value);
        break;
      case 'CATEGORIES':
        if (event.extendedProps) {
          event.extendedProps.categories = value.split(',');
        }
        break;
      case 'STATUS':
        if (event.extendedProps) {
          event.extendedProps.status = value;
        }
        break;
      case 'PRIORITY':
        if (event.extendedProps) {
          event.extendedProps.priority = parseInt(value, 10);
        }
        break;
    }
  }

  /**
   * 解析 iCal 日期
   */
  private parseICalDate(value: string, params: string[]): Date {
    // 检查是否是全天事件
    const isDate = params.some(p => p.startsWith('VALUE=DATE'));

    if (value.length === 8) {
      // YYYYMMDD 格式
      const year = parseInt(value.substr(0, 4), 10);
      const month = parseInt(value.substr(4, 2), 10) - 1;
      const day = parseInt(value.substr(6, 2), 10);
      return new Date(year, month, day);
    } else if (value.endsWith('Z')) {
      // UTC 时间
      return new Date(value);
    } else {
      // 本地时间 YYYYMMDDTHHMMSS
      const year = parseInt(value.substr(0, 4), 10);
      const month = parseInt(value.substr(4, 2), 10) - 1;
      const day = parseInt(value.substr(6, 2), 10);
      const hour = parseInt(value.substr(9, 2), 10);
      const minute = parseInt(value.substr(11, 2), 10);
      const second = parseInt(value.substr(13, 2), 10);
      return new Date(year, month, day, hour, minute, second);
    }
  }

  /**
   * 解析重复规则
   */
  private parseRRule(value: string): RecurrenceRule {
    const rule: RecurrenceRule = { freq: 'daily' };
    const parts = value.split(';');

    for (const part of parts) {
      const [key, val] = part.split('=');
      switch (key) {
        case 'FREQ':
          rule.freq = val.toLowerCase() as RecurrenceRule['freq'];
          break;
        case 'INTERVAL':
          rule.interval = parseInt(val, 10);
          break;
        case 'COUNT':
          rule.count = parseInt(val, 10);
          break;
        case 'UNTIL':
          rule.until = this.parseICalDate(val, []);
          break;
        case 'BYDAY':
          rule.byweekday = this.parseDayList(val);
          break;
        case 'BYMONTHDAY':
          rule.bymonthday = val.split(',').map(d => parseInt(d, 10));
          break;
        case 'BYMONTH':
          rule.bymonth = val.split(',').map(m => parseInt(m, 10));
          break;
      }
    }

    return rule;
  }

  /**
   * 解析星期列表
   */
  private parseDayList(value: string): number[] {
    const dayMap: Record<string, number> = {
      SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
    };

    return value.split(',').map(day => {
      const dayCode = day.match(/[A-Z]{2}$/)?.[0];
      return dayCode ? dayMap[dayCode] : 0;
    }).filter(d => d !== undefined);
  }

  /**
   * 反转义 iCal 文本
   */
  private unescapeICalText(text: string): string {
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\');
  }

  /**
   * 导入 CSV 格式
   */
  private importCSV(content: string): ImportResult {
    const result: ImportResult = {
      events: [],
      errors: [],
      stats: { total: 0, success: 0, failed: 0, skipped: 0 },
    };

    try {
      const lines = content.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) {
        result.errors.push({ message: 'CSV file is empty or has no data rows' });
        return result;
      }

      // 解析标题行
      const headers = this.parseCSVLine(lines[0]);
      const headerMap = new Map(headers.map((h, i) => [h.toLowerCase(), i]));

      // 解析数据行
      for (let i = 1; i < lines.length; i++) {
        result.stats.total++;
        try {
          const values = this.parseCSVLine(lines[i]);
          const event = this.csvRowToEvent(values, headerMap);
          result.events.push(event);
          result.stats.success++;
        } catch (error) {
          result.errors.push({
            line: i + 1,
            message: error instanceof Error ? error.message : 'Failed to parse row',
          });
          result.stats.failed++;
        }
      }
    } catch (error) {
      result.errors.push({
        message: error instanceof Error ? error.message : 'Failed to parse CSV',
      });
    }

    return result;
  }

  /**
   * 解析 CSV 行
   */
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === this.config.csvSeparator && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  }

  /**
   * CSV 行转换为事件
   */
  private csvRowToEvent(values: string[], headerMap: Map<string, number>): CalendarEvent {
    const getValue = (key: string): string => {
      const index = headerMap.get(key.toLowerCase());
      return index !== undefined ? values[index] || '' : '';
    };

    const event: Partial<CalendarEvent> = {
      id: getValue('id') || `event-${Date.now()}-${Math.random()}`,
      title: getValue('title') || getValue('summary') || 'Untitled',
      start: new Date(getValue('start') || getValue('start date')),
      end: new Date(getValue('end') || getValue('end date')),
      allDay: getValue('all day')?.toLowerCase() === 'true',
      description: getValue('description'),
      location: getValue('location'),
      color: getValue('color'),
      extendedProps: {},
    };

    // 添加其他属性到 extendedProps
    headerMap.forEach((index, header) => {
      if (!['id', 'title', 'summary', 'start', 'end', 'start date', 'end date',
        'all day', 'description', 'location', 'color'].includes(header)) {
        if (event.extendedProps) {
          event.extendedProps[header] = values[index];
        }
      }
    });

    return this.validateEvent(event);
  }

  /**
   * 导入 JSON 格式
   */
  private importJSON(content: string): ImportResult {
    const result: ImportResult = {
      events: [],
      errors: [],
      stats: { total: 0, success: 0, failed: 0, skipped: 0 },
    };

    try {
      const data = JSON.parse(content);
      const events = Array.isArray(data) ? data : data.events || [data];

      for (const eventData of events) {
        result.stats.total++;
        try {
          const event = this.jsonToEvent(eventData);
          result.events.push(event);
          result.stats.success++;
        } catch (error) {
          result.errors.push({
            message: error instanceof Error ? error.message : 'Failed to parse event',
          });
          result.stats.failed++;
        }
      }
    } catch (error) {
      result.errors.push({
        message: error instanceof Error ? error.message : 'Invalid JSON format',
      });
    }

    return result;
  }

  /**
   * JSON 转换为事件
   */
  private jsonToEvent(data: any): CalendarEvent {
    const event: Partial<CalendarEvent> = {
      id: data.id || `event-${Date.now()}-${Math.random()}`,
      title: data.title || 'Untitled',
      start: new Date(data.start),
      end: new Date(data.end),
      allDay: data.allDay || false,
      color: data.color,
      backgroundColor: data.backgroundColor,
      borderColor: data.borderColor,
      textColor: data.textColor,
      description: data.description,
      location: data.location,
      recurrence: data.recurrence,
      editable: data.editable,
      draggable: data.draggable,
      resizable: data.resizable,
      extendedProps: data.extendedProps || {},
    };

    return this.validateEvent(event);
  }

  /**
   * 验证事件
   */
  private validateEvent(event: Partial<CalendarEvent>): CalendarEvent {
    if (!event.id) {
      event.id = `event-${Date.now()}-${Math.random()}`;
    }

    if (!event.title) {
      throw new Error('Event title is required');
    }

    if (!event.start || !(event.start instanceof Date) || isNaN(event.start.getTime())) {
      throw new Error('Valid start date is required');
    }

    if (!event.end || !(event.end instanceof Date) || isNaN(event.end.getTime())) {
      throw new Error('Valid end date is required');
    }

    if (event.start > event.end) {
      throw new Error('End date must be after start date');
    }

    return event as CalendarEvent;
  }

  /**
   * 导出 iCal 格式
   */
  private exportICal(events: CalendarEvent[], options: ExportOptions): string {
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LDesign//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    const filteredEvents = this.filterEvents(events, options);

    for (const event of filteredEvents) {
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${event.id}`);
      lines.push(`SUMMARY:${this.escapeICalText(event.title)}`);

      if (event.description) {
        lines.push(`DESCRIPTION:${this.escapeICalText(event.description)}`);
      }

      if (event.location) {
        lines.push(`LOCATION:${this.escapeICalText(event.location)}`);
      }

      // 日期时间
      if (event.allDay) {
        lines.push(`DTSTART;VALUE=DATE:${this.formatICalDate(event.start, true)}`);
        lines.push(`DTEND;VALUE=DATE:${this.formatICalDate(event.end, true)}`);
      } else {
        lines.push(`DTSTART:${this.formatICalDate(event.start, false)}`);
        lines.push(`DTEND:${this.formatICalDate(event.end, false)}`);
      }

      // 重复规则
      if (event.recurrence) {
        lines.push(`RRULE:${this.formatRRule(event.recurrence)}`);
      }

      // 扩展属性
      if (event.extendedProps && this.config.includePrivateProps) {
        if (event.extendedProps.categories) {
          lines.push(`CATEGORIES:${event.extendedProps.categories.join(',')}`);
        }
        if (event.extendedProps.status) {
          lines.push(`STATUS:${event.extendedProps.status}`);
        }
        if (event.extendedProps.priority) {
          lines.push(`PRIORITY:${event.extendedProps.priority}`);
        }
      }

      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  /**
   * 转义 iCal 文本
   */
  private escapeICalText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
  }

  /**
   * 格式化 iCal 日期
   */
  private formatICalDate(date: Date, dateOnly: boolean): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    if (dateOnly) {
      return `${year}${month}${day}`;
    }

    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');

    return `${year}${month}${day}T${hour}${minute}${second}`;
  }

  /**
   * 格式化重复规则
   */
  private formatRRule(rule: RecurrenceRule): string {
    const parts: string[] = [`FREQ=${rule.freq.toUpperCase()}`];

    if (rule.interval) {
      parts.push(`INTERVAL=${rule.interval}`);
    }

    if (rule.count) {
      parts.push(`COUNT=${rule.count}`);
    }

    if (rule.until) {
      parts.push(`UNTIL=${this.formatICalDate(rule.until, false)}`);
    }

    if (rule.byweekday) {
      const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      const dayList = rule.byweekday.map(d => days[d]).join(',');
      parts.push(`BYDAY=${dayList}`);
    }

    if (rule.bymonthday) {
      parts.push(`BYMONTHDAY=${rule.bymonthday.join(',')}`);
    }

    if (rule.bymonth) {
      parts.push(`BYMONTH=${rule.bymonth.join(',')}`);
    }

    return parts.join(';');
  }

  /**
   * 导出 CSV 格式
   */
  private exportCSV(events: CalendarEvent[], options: ExportOptions): string {
    const headers = [
      'ID', 'Title', 'Start', 'End', 'All Day',
      'Description', 'Location', 'Color'
    ];

    const rows: string[][] = [headers];
    const filteredEvents = this.filterEvents(events, options);

    for (const event of filteredEvents) {
      const row = [
        event.id,
        event.title,
        this.formatDateTime(event.start),
        this.formatDateTime(event.end),
        event.allDay ? 'TRUE' : 'FALSE',
        event.description || '',
        event.location || '',
        event.color || '',
      ];
      rows.push(row);
    }

    return rows.map(row =>
      row.map(cell => this.escapeCSVCell(cell)).join(this.config.csvSeparator)
    ).join('\n');
  }

  /**
   * 转义 CSV 单元格
   */
  private escapeCSVCell(cell: string): string {
    if (cell.includes('"') || cell.includes(this.config.csvSeparator) || cell.includes('\n')) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  }

  /**
   * 导出 JSON 格式
   */
  private exportJSON(events: CalendarEvent[], options: ExportOptions): string {
    const filteredEvents = this.filterEvents(events, options);
    return JSON.stringify(filteredEvents, null, 2);
  }

  /**
   * 过滤事件
   */
  private filterEvents(events: CalendarEvent[], options: ExportOptions): CalendarEvent[] {
    let filtered = [...events];

    // 按日期范围过滤
    if (options.dateRange) {
      filtered = filtered.filter(event =>
        event.start >= options.dateRange!.start &&
        event.end <= options.dateRange!.end
      );
    }

    // 按ID过滤
    if (options.eventIds) {
      const idSet = new Set(options.eventIds);
      filtered = filtered.filter(event => idSet.has(event.id));
    }

    return filtered;
  }

  /**
   * 格式化日期时间
   */
  private formatDateTime(date: Date): string {
    return date.toISOString();
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(format: 'ical' | 'csv' | 'json'): string {
    switch (format) {
      case 'ical':
        return 'ics';
      case 'csv':
        return 'csv';
      case 'json':
        return 'json';
    }
  }

  /**
   * 获取 MIME 类型
   */
  private getMimeType(format: 'ical' | 'csv' | 'json'): string {
    switch (format) {
      case 'ical':
        return 'text/calendar';
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
    }
  }

  /**
   * 下载文件
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * 创建导入模板
   */
  public createTemplate(format: 'csv' | 'json'): string {
    switch (format) {
      case 'csv':
        return [
          'ID,Title,Start,End,All Day,Description,Location,Color',
          'event-1,Team Meeting,2024-01-15T10:00:00,2024-01-15T11:00:00,FALSE,Weekly team sync,Conference Room A,#1890ff',
          'event-2,Project Deadline,2024-01-20T00:00:00,2024-01-20T23:59:59,TRUE,Submit final report,,#f5222d',
        ].join('\n');

      case 'json':
        return JSON.stringify([
          {
            id: 'event-1',
            title: 'Team Meeting',
            start: '2024-01-15T10:00:00',
            end: '2024-01-15T11:00:00',
            allDay: false,
            description: 'Weekly team sync',
            location: 'Conference Room A',
            color: '#1890ff',
          },
          {
            id: 'event-2',
            title: 'Project Deadline',
            start: '2024-01-20T00:00:00',
            end: '2024-01-20T23:59:59',
            allDay: true,
            description: 'Submit final report',
            color: '#f5222d',
          },
        ], null, 2);
    }
  }
}

/**
 * 创建导入导出管理器实例
 */
export function createImportExportManager(config?: ImportExportConfig): ImportExportManager {
  return new ImportExportManager(config);
}

