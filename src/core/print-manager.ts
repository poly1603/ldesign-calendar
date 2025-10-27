/**
 * 打印管理器 - 提供日历打印功能
 * @module print-manager
 */

import type { CalendarEvent } from '../types';
import type { CalendarView } from '../types';

export interface PrintConfig {
  /** 纸张方向 */
  orientation?: 'portrait' | 'landscape';
  /** 纸张大小 */
  paperSize?: 'A4' | 'A3' | 'Letter' | 'Legal';
  /** 页边距（毫米） */
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** 是否显示页眉 */
  showHeader?: boolean;
  /** 是否显示页脚 */
  showFooter?: boolean;
  /** 页眉内容 */
  headerContent?: string | ((page: number, total: number) => string);
  /** 页脚内容 */
  footerContent?: string | ((page: number, total: number) => string);
  /** 是否打印背景色 */
  printBackground?: boolean;
  /** 是否打印事件详情 */
  printEventDetails?: boolean;
  /** 自定义CSS */
  customCSS?: string;
}

export interface PrintOptions {
  /** 打印视图 */
  view: CalendarView;
  /** 日期范围 */
  dateRange: { start: Date; end: Date };
  /** 要打印的事件 */
  events?: CalendarEvent[];
  /** 是否预览 */
  preview?: boolean;
  /** 标题 */
  title?: string;
}

export class PrintManager {
  private config: Required<PrintConfig>;
  private printWindow: Window | null = null;
  private printStyleSheet: HTMLStyleElement | null = null;

  constructor(config: PrintConfig = {}) {
    this.config = {
      orientation: config.orientation || 'portrait',
      paperSize: config.paperSize || 'A4',
      margins: config.margins || { top: 10, right: 10, bottom: 10, left: 10 },
      showHeader: config.showHeader !== false,
      showFooter: config.showFooter !== false,
      headerContent: config.headerContent || ((page, total) => `Page ${page} of ${total}`),
      footerContent: config.footerContent || (() => new Date().toLocaleDateString()),
      printBackground: config.printBackground !== false,
      printEventDetails: config.printEventDetails !== false,
      customCSS: config.customCSS || '',
    };
  }

  /**
   * 打印日历
   */
  public async print(options: PrintOptions): Promise<void> {
    if (options.preview) {
      await this.showPreview(options);
    } else {
      await this.executePrint(options);
    }
  }

  /**
   * 显示打印预览
   */
  private async showPreview(options: PrintOptions): Promise<void> {
    // 创建预览窗口
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (!previewWindow) {
      throw new Error('Failed to open preview window');
    }

    this.printWindow = previewWindow;
    const content = await this.generatePrintContent(options);

    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>打印预览 - ${options.title || '日历'}</title>
          ${this.generatePrintStyles()}
          <style>
            body {
              margin: 0;
              padding: 20px;
              background: #f0f0f0;
            }
            .print-preview-container {
              background: white;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              margin: 0 auto;
              max-width: 210mm;
            }
            .print-preview-toolbar {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: white;
              border-bottom: 1px solid #ddd;
              padding: 10px;
              z-index: 1000;
              display: flex;
              justify-content: center;
              gap: 10px;
            }
            .print-preview-content {
              margin-top: 60px;
            }
            .print-preview-button {
              padding: 8px 16px;
              border: 1px solid #ddd;
              background: white;
              cursor: pointer;
              border-radius: 4px;
            }
            .print-preview-button:hover {
              background: #f5f5f5;
            }
            .print-preview-button.primary {
              background: #1890ff;
              color: white;
              border-color: #1890ff;
            }
            .print-preview-button.primary:hover {
              background: #40a9ff;
            }
          </style>
        </head>
        <body>
          <div class="print-preview-toolbar">
            <button class="print-preview-button primary" onclick="window.print()">打印</button>
            <button class="print-preview-button" onclick="window.close()">关闭</button>
          </div>
          <div class="print-preview-content">
            <div class="print-preview-container">
              ${content}
            </div>
          </div>
        </body>
      </html>
    `);
  }

  /**
   * 执行打印
   */
  private async executePrint(options: PrintOptions): Promise<void> {
    const content = await this.generatePrintContent(options);

    // 创建隐藏的iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) {
      document.body.removeChild(iframe);
      throw new Error('Failed to create print frame');
    }

    // 写入内容
    iframeWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${options.title || '日历打印'}</title>
          ${this.generatePrintStyles()}
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    iframeWindow.document.close();

    // 等待内容加载
    await new Promise(resolve => {
      iframeWindow.onload = resolve;
      setTimeout(resolve, 100);
    });

    // 执行打印
    iframeWindow.print();

    // 清理
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }

  /**
   * 生成打印内容
   */
  private async generatePrintContent(options: PrintOptions): Promise<string> {
    switch (options.view) {
      case 'month':
        return this.generateMonthView(options);
      case 'week':
        return this.generateWeekView(options);
      case 'day':
        return this.generateDayView(options);
      case 'agenda':
        return this.generateAgendaView(options);
      default:
        return this.generateMonthView(options);
    }
  }

  /**
   * 生成月视图打印内容
   */
  private generateMonthView(options: PrintOptions): string {
    const { start, end } = options.dateRange;
    const events = options.events || [];

    // 计算月份的第一天和最后一天
    const firstDay = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0);

    // 计算需要显示的周数
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const weeksNeeded = Math.ceil((startWeekday + daysInMonth) / 7);

    let html = `
      <div class="print-container">
        ${this.generateHeader(options)}
        <div class="print-content">
          <h2 class="print-month-title">${this.formatMonthYear(start)}</h2>
          <table class="print-month-table">
            <thead>
              <tr>
                <th>周日</th>
                <th>周一</th>
                <th>周二</th>
                <th>周三</th>
                <th>周四</th>
                <th>周五</th>
                <th>周六</th>
              </tr>
            </thead>
            <tbody>
    `;

    let currentDate = new Date(firstDay);
    currentDate.setDate(currentDate.getDate() - startWeekday);

    for (let week = 0; week < weeksNeeded; week++) {
      html += '<tr>';

      for (let day = 0; day < 7; day++) {
        const isCurrentMonth = currentDate.getMonth() === start.getMonth();
        const dayEvents = this.getEventsForDate(events, currentDate);

        html += `
          <td class="print-month-cell ${isCurrentMonth ? '' : 'print-month-cell--other'}">
            <div class="print-month-cell-date">${currentDate.getDate()}</div>
            ${this.generateEventList(dayEvents, 'month')}
          </td>
        `;

        currentDate.setDate(currentDate.getDate() + 1);
      }

      html += '</tr>';
    }

    html += `
            </tbody>
          </table>
        </div>
        ${this.generateFooter(options)}
      </div>
    `;

    return html;
  }

  /**
   * 生成周视图打印内容
   */
  private generateWeekView(options: PrintOptions): string {
    const { start } = options.dateRange;
    const events = options.events || [];

    // 获取周的开始和结束
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() - start.getDay());

    let html = `
      <div class="print-container">
        ${this.generateHeader(options)}
        <div class="print-content">
          <h2 class="print-week-title">
            ${this.formatDateRange(weekStart, new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000))}
          </h2>
          <div class="print-week-grid">
    `;

    // 时间轴
    html += '<div class="print-week-times">';
    for (let hour = 0; hour < 24; hour++) {
      html += `
        <div class="print-week-time">
          ${hour.toString().padStart(2, '0')}:00
        </div>
      `;
    }
    html += '</div>';

    // 每天的列
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + day);
      const dayEvents = this.getEventsForDate(events, currentDate);

      html += `
        <div class="print-week-day">
          <div class="print-week-day-header">
            <div class="print-week-day-name">${this.getDayName(day)}</div>
            <div class="print-week-day-date">${currentDate.getDate()}</div>
          </div>
          <div class="print-week-day-events">
            ${this.generateTimelineEvents(dayEvents)}
          </div>
        </div>
      `;
    }

    html += `
          </div>
        </div>
        ${this.generateFooter(options)}
      </div>
    `;

    return html;
  }

  /**
   * 生成日视图打印内容
   */
  private generateDayView(options: PrintOptions): string {
    const { start } = options.dateRange;
    const events = options.events || [];
    const dayEvents = this.getEventsForDate(events, start);

    let html = `
      <div class="print-container">
        ${this.generateHeader(options)}
        <div class="print-content">
          <h2 class="print-day-title">${this.formatDate(start)}</h2>
          <div class="print-day-timeline">
    `;

    // 生成24小时时间线
    for (let hour = 0; hour < 24; hour++) {
      const hourEvents = dayEvents.filter(event => {
        const eventHour = event.start.getHours();
        return !event.allDay && eventHour === hour;
      });

      html += `
        <div class="print-day-hour">
          <div class="print-day-hour-label">
            ${hour.toString().padStart(2, '0')}:00
          </div>
          <div class="print-day-hour-events">
            ${this.generateEventList(hourEvents, 'day')}
          </div>
        </div>
      `;
    }

    // 全天事件
    const allDayEvents = dayEvents.filter(event => event.allDay);
    if (allDayEvents.length > 0) {
      html += `
        <div class="print-day-allday">
          <div class="print-day-allday-label">全天</div>
          <div class="print-day-allday-events">
            ${this.generateEventList(allDayEvents, 'day')}
          </div>
        </div>
      `;
    }

    html += `
          </div>
        </div>
        ${this.generateFooter(options)}
      </div>
    `;

    return html;
  }

  /**
   * 生成议程视图打印内容
   */
  private generateAgendaView(options: PrintOptions): string {
    const events = (options.events || []).sort((a, b) =>
      a.start.getTime() - b.start.getTime()
    );

    let html = `
      <div class="print-container">
        ${this.generateHeader(options)}
        <div class="print-content">
          <h2 class="print-agenda-title">事件列表</h2>
          <table class="print-agenda-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>时间</th>
                <th>标题</th>
                <th>地点</th>
                ${this.config.printEventDetails ? '<th>描述</th>' : ''}
              </tr>
            </thead>
            <tbody>
    `;

    events.forEach(event => {
      html += `
        <tr>
          <td>${this.formatDate(event.start)}</td>
          <td>
            ${event.allDay ? '全天' : `${this.formatTime(event.start)} - ${this.formatTime(event.end)}`}
          </td>
          <td>${event.title}</td>
          <td>${event.location || '-'}</td>
          ${this.config.printEventDetails ? `<td>${event.description || '-'}</td>` : ''}
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </div>
        ${this.generateFooter(options)}
      </div>
    `;

    return html;
  }

  /**
   * 生成打印样式
   */
  private generatePrintStyles(): string {
    const { orientation, paperSize, margins, printBackground } = this.config;

    return `
      <style>
        @page {
          size: ${paperSize} ${orientation};
          margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: ${printBackground ? 'exact' : 'economy'};
            print-color-adjust: ${printBackground ? 'exact' : 'economy'};
          }
          
          .print-preview-toolbar {
            display: none !important;
          }
          
          .print-preview-container {
            box-shadow: none !important;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
        }
        
        .print-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .print-header, .print-footer {
          text-align: center;
          padding: 10px 0;
          font-size: 10pt;
          color: #666;
        }
        
        .print-content {
          flex: 1;
          padding: 20px;
        }
        
        /* 月视图样式 */
        .print-month-title {
          text-align: center;
          margin-bottom: 20px;
          font-size: 18pt;
        }
        
        .print-month-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        
        .print-month-table th,
        .print-month-table td {
          border: 1px solid #ddd;
          padding: 8px;
          vertical-align: top;
        }
        
        .print-month-table th {
          background-color: #f5f5f5;
          font-weight: bold;
          text-align: center;
        }
        
        .print-month-cell {
          height: 80px;
          position: relative;
        }
        
        .print-month-cell--other {
          color: #ccc;
          background-color: #fafafa;
        }
        
        .print-month-cell-date {
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        /* 周视图样式 */
        .print-week-title {
          text-align: center;
          margin-bottom: 20px;
          font-size: 16pt;
        }
        
        .print-week-grid {
          display: grid;
          grid-template-columns: 60px repeat(7, 1fr);
          gap: 0;
          border: 1px solid #ddd;
        }
        
        .print-week-times {
          border-right: 1px solid #ddd;
        }
        
        .print-week-time {
          height: 40px;
          padding: 4px;
          border-bottom: 1px solid #eee;
          font-size: 10pt;
          color: #666;
        }
        
        .print-week-day {
          border-right: 1px solid #ddd;
        }
        
        .print-week-day:last-child {
          border-right: none;
        }
        
        .print-week-day-header {
          padding: 8px;
          border-bottom: 1px solid #ddd;
          background-color: #f5f5f5;
          text-align: center;
        }
        
        .print-week-day-name {
          font-weight: bold;
        }
        
        /* 日视图样式 */
        .print-day-title {
          text-align: center;
          margin-bottom: 20px;
          font-size: 16pt;
        }
        
        .print-day-hour {
          display: flex;
          border-bottom: 1px solid #eee;
          min-height: 60px;
        }
        
        .print-day-hour-label {
          width: 80px;
          padding: 8px;
          color: #666;
          font-size: 10pt;
        }
        
        .print-day-hour-events {
          flex: 1;
          padding: 8px;
        }
        
        /* 议程视图样式 */
        .print-agenda-title {
          text-align: center;
          margin-bottom: 20px;
          font-size: 16pt;
        }
        
        .print-agenda-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .print-agenda-table th,
        .print-agenda-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        .print-agenda-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        /* 事件样式 */
        .print-event {
          margin: 2px 0;
          padding: 2px 4px;
          background-color: #e6f7ff;
          border-left: 3px solid #1890ff;
          font-size: 10pt;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .print-event-time {
          font-size: 9pt;
          color: #666;
        }
        
        /* 分页 */
        .page-break {
          page-break-after: always;
        }
        
        ${this.config.customCSS}
      </style>
    `;
  }

  /**
   * 生成页眉
   */
  private generateHeader(options: PrintOptions): string {
    if (!this.config.showHeader) return '';

    const content = typeof this.config.headerContent === 'function'
      ? this.config.headerContent(1, 1)
      : this.config.headerContent;

    return `<div class="print-header">${content}</div>`;
  }

  /**
   * 生成页脚
   */
  private generateFooter(options: PrintOptions): string {
    if (!this.config.showFooter) return '';

    const content = typeof this.config.footerContent === 'function'
      ? this.config.footerContent(1, 1)
      : this.config.footerContent;

    return `<div class="print-footer">${content}</div>`;
  }

  /**
   * 生成事件列表
   */
  private generateEventList(events: CalendarEvent[], view: string): string {
    if (events.length === 0) return '';

    const maxEvents = view === 'month' ? 3 : 10;
    const displayEvents = events.slice(0, maxEvents);

    let html = '';
    displayEvents.forEach(event => {
      html += `
        <div class="print-event" style="border-color: ${event.color || '#1890ff'}">
          ${event.allDay ? '' : `<span class="print-event-time">${this.formatTime(event.start)}</span> `}
          ${event.title}
        </div>
      `;
    });

    if (events.length > maxEvents) {
      html += `<div class="print-event-more">还有 ${events.length - maxEvents} 个事件...</div>`;
    }

    return html;
  }

  /**
   * 生成时间线事件
   */
  private generateTimelineEvents(events: CalendarEvent[]): string {
    let html = '';

    events.forEach(event => {
      if (!event.allDay) {
        const top = (event.start.getHours() + event.start.getMinutes() / 60) * 40;
        const height = ((event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)) * 40;

        html += `
          <div class="print-timeline-event" style="
            position: absolute;
            top: ${top}px;
            height: ${height}px;
            left: 0;
            right: 0;
            background-color: ${event.color || '#1890ff'}20;
            border-left: 3px solid ${event.color || '#1890ff'};
            padding: 2px 4px;
            overflow: hidden;
          ">
            <div style="font-size: 10pt; font-weight: bold;">${this.formatTime(event.start)}</div>
            <div style="font-size: 9pt;">${event.title}</div>
          </div>
        `;
      }
    });

    return html;
  }

  /**
   * 获取指定日期的事件
   */
  private getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    return events.filter(event => {
      return event.start <= dateEnd && event.end >= dateStart;
    });
  }

  /**
   * 格式化月份年份
   */
  private formatMonthYear(date: Date): string {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
    }).format(date);
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long',
    }).format(date);
  }

  /**
   * 格式化日期范围
   */
  private formatDateRange(start: Date, end: Date): string {
    return `${this.formatDate(start)} - ${this.formatDate(end)}`;
  }

  /**
   * 格式化时间
   */
  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  /**
   * 获取星期名称
   */
  private getDayName(dayIndex: number): string {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[dayIndex];
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<PrintConfig>): void {
    Object.assign(this.config, config);
  }

  /**
   * 生成 PDF（需要外部库支持）
   */
  public async exportPDF(options: PrintOptions): Promise<Blob> {
    // 这里需要集成 PDF 生成库，如 jsPDF 或 pdfmake
    throw new Error('PDF export requires external library integration');
  }
}

/**
 * 创建打印管理器实例
 */
export function createPrintManager(config?: PrintConfig): PrintManager {
  return new PrintManager(config);
}

