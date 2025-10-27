/**
 * 高级搜索面板 - 提供强大的事件搜索和过滤功能
 * @module search-panel
 */

import type { CalendarEvent } from '../types';

export interface SearchConfig {
  /** 是否启用正则表达式搜索 */
  enableRegex?: boolean;
  /** 是否高亮搜索结果 */
  highlightResults?: boolean;
  /** 搜索延迟（毫秒） */
  debounceDelay?: number;
  /** 最大搜索结果数 */
  maxResults?: number;
  /** 搜索字段 */
  searchFields?: Array<keyof CalendarEvent | 'any'>;
  /** 是否区分大小写 */
  caseSensitive?: boolean;
  /** 是否搜索扩展属性 */
  searchExtendedProps?: boolean;
}

export interface SearchFilter {
  /** 过滤器ID */
  id: string;
  /** 过滤器名称 */
  name: string;
  /** 过滤器类型 */
  type: 'text' | 'date' | 'time' | 'select' | 'color' | 'boolean';
  /** 字段名 */
  field: string;
  /** 操作符 */
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex' |
  'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'notIn';
  /** 值 */
  value: any;
  /** 是否激活 */
  active: boolean;
}

export interface SearchQuery {
  /** 搜索文本 */
  text?: string;
  /** 过滤器列表 */
  filters?: SearchFilter[];
  /** 日期范围 */
  dateRange?: { start: Date; end: Date };
  /** 排序字段 */
  sortBy?: keyof CalendarEvent;
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
  /** 分页 */
  pagination?: {
    page: number;
    pageSize: number;
  };
}

export interface SearchResult {
  /** 匹配的事件 */
  events: CalendarEvent[];
  /** 总匹配数 */
  total: number;
  /** 高亮信息 */
  highlights?: Map<string, Array<{ start: number; end: number }>>;
  /** 搜索耗时（毫秒） */
  duration: number;
  /** 匹配的过滤器 */
  matchedFilters?: string[];
}

export class SearchPanel {
  private config: Required<SearchConfig>;
  private searchIndex: Map<string, Set<string>> = new Map();
  private debounceTimer: number | null = null;
  private lastQuery: SearchQuery | null = null;
  private customFilters: Map<string, (event: CalendarEvent, value: any) => boolean> = new Map();

  constructor(config: SearchConfig = {}) {
    this.config = {
      enableRegex: config.enableRegex !== false,
      highlightResults: config.highlightResults !== false,
      debounceDelay: config.debounceDelay || 300,
      maxResults: config.maxResults || 100,
      searchFields: config.searchFields || ['any'],
      caseSensitive: config.caseSensitive || false,
      searchExtendedProps: config.searchExtendedProps !== false,
    };
  }

  /**
   * 构建搜索索引
   */
  public buildIndex(events: CalendarEvent[]): void {
    this.searchIndex.clear();

    events.forEach(event => {
      const tokens = this.extractTokens(event);
      tokens.forEach(token => {
        if (!this.searchIndex.has(token)) {
          this.searchIndex.set(token, new Set());
        }
        this.searchIndex.get(token)!.add(event.id);
      });
    });
  }

  /**
   * 提取事件的搜索标记
   */
  private extractTokens(event: CalendarEvent): Set<string> {
    const tokens = new Set<string>();
    const fields = this.config.searchFields;

    const addTokens = (text: string) => {
      if (!text) return;
      const normalized = this.config.caseSensitive ? text : text.toLowerCase();
      // 分词
      const words = normalized.split(/\s+/);
      words.forEach(word => {
        if (word.length > 1) {
          tokens.add(word);
          // 添加前缀用于自动完成
          for (let i = 2; i <= word.length; i++) {
            tokens.add(word.substring(0, i));
          }
        }
      });
    };

    if (fields.includes('any') || fields.includes('title')) {
      addTokens(event.title);
    }

    if (fields.includes('any') || fields.includes('description')) {
      addTokens(event.description || '');
    }

    if (fields.includes('any') || fields.includes('location')) {
      addTokens(event.location || '');
    }

    // 搜索扩展属性
    if (this.config.searchExtendedProps && event.extendedProps) {
      Object.values(event.extendedProps).forEach(value => {
        if (typeof value === 'string') {
          addTokens(value);
        }
      });
    }

    return tokens;
  }

  /**
   * 执行搜索
   */
  public search(events: CalendarEvent[], query: SearchQuery): Promise<SearchResult> {
    return new Promise(resolve => {
      // 清除之前的防抖定时器
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = window.setTimeout(() => {
        const startTime = performance.now();
        const result = this.executeSearch(events, query);
        result.duration = performance.now() - startTime;

        this.lastQuery = query;
        resolve(result);
      }, this.config.debounceDelay);
    });
  }

  /**
   * 立即执行搜索（不防抖）
   */
  public searchImmediate(events: CalendarEvent[], query: SearchQuery): SearchResult {
    const startTime = performance.now();
    const result = this.executeSearch(events, query);
    result.duration = performance.now() - startTime;

    this.lastQuery = query;
    return result;
  }

  /**
   * 执行搜索逻辑
   */
  private executeSearch(events: CalendarEvent[], query: SearchQuery): SearchResult {
    let filteredEvents = [...events];
    const highlights = new Map<string, Array<{ start: number; end: number }>>();
    const matchedFilters: string[] = [];

    // 文本搜索
    if (query.text) {
      const searchResults = this.textSearch(filteredEvents, query.text);
      filteredEvents = searchResults.events;

      if (this.config.highlightResults) {
        searchResults.highlights.forEach((ranges, eventId) => {
          highlights.set(eventId, ranges);
        });
      }
    }

    // 应用过滤器
    if (query.filters) {
      query.filters.forEach(filter => {
        if (filter.active) {
          filteredEvents = this.applyFilter(filteredEvents, filter);
          if (filteredEvents.length > 0) {
            matchedFilters.push(filter.id);
          }
        }
      });
    }

    // 日期范围过滤
    if (query.dateRange) {
      filteredEvents = filteredEvents.filter(event =>
        event.start >= query.dateRange!.start &&
        event.end <= query.dateRange!.end
      );
    }

    // 排序
    if (query.sortBy) {
      filteredEvents = this.sortEvents(filteredEvents, query.sortBy, query.sortOrder || 'asc');
    }

    // 分页
    let paginatedEvents = filteredEvents;
    if (query.pagination) {
      const { page, pageSize } = query.pagination;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      paginatedEvents = filteredEvents.slice(start, end);
    } else if (filteredEvents.length > this.config.maxResults) {
      paginatedEvents = filteredEvents.slice(0, this.config.maxResults);
    }

    return {
      events: paginatedEvents,
      total: filteredEvents.length,
      highlights: this.config.highlightResults ? highlights : undefined,
      duration: 0,
      matchedFilters: matchedFilters.length > 0 ? matchedFilters : undefined,
    };
  }

  /**
   * 文本搜索
   */
  private textSearch(
    events: CalendarEvent[],
    searchText: string
  ): { events: CalendarEvent[]; highlights: Map<string, Array<{ start: number; end: number }>> } {
    const highlights = new Map<string, Array<{ start: number; end: number }>>();
    const normalizedSearch = this.config.caseSensitive ? searchText : searchText.toLowerCase();

    // 检查是否是正则表达式
    let regex: RegExp | null = null;
    if (this.config.enableRegex && searchText.startsWith('/') && searchText.endsWith('/')) {
      try {
        const pattern = searchText.slice(1, -1);
        regex = new RegExp(pattern, this.config.caseSensitive ? 'g' : 'gi');
      } catch {
        // 无效的正则表达式，回退到普通搜索
      }
    }

    const matchedEvents = events.filter(event => {
      const matched = this.matchEvent(event, normalizedSearch, regex);

      if (matched && this.config.highlightResults) {
        const ranges = this.findHighlightRanges(event, normalizedSearch, regex);
        if (ranges.length > 0) {
          highlights.set(event.id, ranges);
        }
      }

      return matched;
    });

    return { events: matchedEvents, highlights };
  }

  /**
   * 匹配事件
   */
  private matchEvent(event: CalendarEvent, searchText: string, regex: RegExp | null): boolean {
    const fields = this.config.searchFields;

    const matchField = (text: string): boolean => {
      if (!text) return false;
      const normalized = this.config.caseSensitive ? text : text.toLowerCase();

      if (regex) {
        return regex.test(text);
      } else {
        return normalized.includes(searchText);
      }
    };

    if (fields.includes('any')) {
      // 搜索所有字段
      if (matchField(event.title)) return true;
      if (matchField(event.description || '')) return true;
      if (matchField(event.location || '')) return true;

      // 搜索扩展属性
      if (this.config.searchExtendedProps && event.extendedProps) {
        for (const value of Object.values(event.extendedProps)) {
          if (typeof value === 'string' && matchField(value)) {
            return true;
          }
        }
      }
    } else {
      // 搜索指定字段
      for (const field of fields) {
        if (field === 'title' && matchField(event.title)) return true;
        if (field === 'description' && matchField(event.description || '')) return true;
        if (field === 'location' && matchField(event.location || '')) return true;
      }
    }

    return false;
  }

  /**
   * 查找高亮范围
   */
  private findHighlightRanges(
    event: CalendarEvent,
    searchText: string,
    regex: RegExp | null
  ): Array<{ start: number; end: number }> {
    const ranges: Array<{ start: number; end: number }> = [];

    const findRangesInText = (text: string, baseOffset: number = 0) => {
      if (!text) return;

      if (regex) {
        // 重置正则表达式
        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
          ranges.push({
            start: baseOffset + match.index,
            end: baseOffset + match.index + match[0].length,
          });
        }
      } else {
        // 普通文本搜索
        const normalized = this.config.caseSensitive ? text : text.toLowerCase();
        let index = normalized.indexOf(searchText);
        while (index !== -1) {
          ranges.push({
            start: baseOffset + index,
            end: baseOffset + index + searchText.length,
          });
          index = normalized.indexOf(searchText, index + 1);
        }
      }
    };

    // 在各个字段中查找
    findRangesInText(event.title, 0);

    return ranges;
  }

  /**
   * 应用过滤器
   */
  private applyFilter(events: CalendarEvent[], filter: SearchFilter): CalendarEvent[] {
    // 检查是否有自定义过滤器
    const customFilter = this.customFilters.get(filter.id);
    if (customFilter) {
      return events.filter(event => customFilter(event, filter.value));
    }

    return events.filter(event => {
      const fieldValue = this.getFieldValue(event, filter.field);

      switch (filter.operator) {
        case 'equals':
          return fieldValue === filter.value;

        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());

        case 'startsWith':
          return String(fieldValue).toLowerCase().startsWith(String(filter.value).toLowerCase());

        case 'endsWith':
          return String(fieldValue).toLowerCase().endsWith(String(filter.value).toLowerCase());

        case 'regex':
          try {
            const regex = new RegExp(filter.value, 'i');
            return regex.test(String(fieldValue));
          } catch {
            return false;
          }

        case 'gt':
          return fieldValue > filter.value;

        case 'gte':
          return fieldValue >= filter.value;

        case 'lt':
          return fieldValue < filter.value;

        case 'lte':
          return fieldValue <= filter.value;

        case 'between':
          return fieldValue >= filter.value[0] && fieldValue <= filter.value[1];

        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(fieldValue);

        case 'notIn':
          return Array.isArray(filter.value) && !filter.value.includes(fieldValue);

        default:
          return true;
      }
    });
  }

  /**
   * 获取字段值
   */
  private getFieldValue(event: CalendarEvent, field: string): any {
    // 处理嵌套字段
    if (field.includes('.')) {
      const parts = field.split('.');
      let value: any = event;

      for (const part of parts) {
        value = value?.[part];
        if (value === undefined) break;
      }

      return value;
    }

    // 直接字段
    return (event as any)[field];
  }

  /**
   * 排序事件
   */
  private sortEvents(
    events: CalendarEvent[],
    sortBy: keyof CalendarEvent,
    order: 'asc' | 'desc'
  ): CalendarEvent[] {
    return [...events].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = aValue < bValue ? -1 : 1;
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * 注册自定义过滤器
   */
  public registerCustomFilter(
    id: string,
    filterFn: (event: CalendarEvent, value: any) => boolean
  ): void {
    this.customFilters.set(id, filterFn);
  }

  /**
   * 创建预设过滤器
   */
  public createPresetFilters(): SearchFilter[] {
    return [
      {
        id: 'today',
        name: '今天',
        type: 'date',
        field: 'start',
        operator: 'between',
        value: [
          new Date(new Date().setHours(0, 0, 0, 0)),
          new Date(new Date().setHours(23, 59, 59, 999)),
        ],
        active: false,
      },
      {
        id: 'this-week',
        name: '本周',
        type: 'date',
        field: 'start',
        operator: 'between',
        value: this.getWeekRange(),
        active: false,
      },
      {
        id: 'this-month',
        name: '本月',
        type: 'date',
        field: 'start',
        operator: 'between',
        value: this.getMonthRange(),
        active: false,
      },
      {
        id: 'all-day',
        name: '全天事件',
        type: 'boolean',
        field: 'allDay',
        operator: 'equals',
        value: true,
        active: false,
      },
      {
        id: 'has-location',
        name: '有地点',
        type: 'text',
        field: 'location',
        operator: 'regex',
        value: '.+',
        active: false,
      },
    ];
  }

  /**
   * 获取本周范围
   */
  private getWeekRange(): [Date, Date] {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return [start, end];
  }

  /**
   * 获取本月范围
   */
  private getMonthRange(): [Date, Date] {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return [start, end];
  }

  /**
   * 获取搜索建议
   */
  public getSuggestions(prefix: string, limit: number = 10): string[] {
    const suggestions: string[] = [];
    const normalizedPrefix = this.config.caseSensitive ? prefix : prefix.toLowerCase();

    for (const [token] of this.searchIndex) {
      if (token.startsWith(normalizedPrefix)) {
        suggestions.push(token);
        if (suggestions.length >= limit) break;
      }
    }

    return suggestions;
  }

  /**
   * 清除搜索索引
   */
  public clearIndex(): void {
    this.searchIndex.clear();
  }

  /**
   * 获取最后的查询
   */
  public getLastQuery(): SearchQuery | null {
    return this.lastQuery;
  }

  /**
   * 导出搜索结果
   */
  public exportResults(result: SearchResult, format: 'csv' | 'json'): string {
    if (format === 'json') {
      return JSON.stringify(result.events, null, 2);
    }

    // CSV 格式
    const headers = ['ID', 'Title', 'Start', 'End', 'Location', 'Description'];
    const rows = [headers];

    result.events.forEach(event => {
      rows.push([
        event.id,
        event.title,
        event.start.toISOString(),
        event.end.toISOString(),
        event.location || '',
        event.description || '',
      ]);
    });

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }
}

/**
 * 创建搜索面板实例
 */
export function createSearchPanel(config?: SearchConfig): SearchPanel {
  return new SearchPanel(config);
}

