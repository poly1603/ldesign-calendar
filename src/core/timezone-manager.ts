/**
 * 时区管理器 - 处理时区转换和显示
 * @module timezone-manager
 */

export interface TimezoneInfo {
  /** 时区标识符 (IANA) */
  id: string;
  /** 显示名称 */
  name: string;
  /** 偏移量（分钟） */
  offset: number;
  /** 缩写 */
  abbr: string;
  /** 是否使用夏令时 */
  isDST?: boolean;
}

export interface TimezoneConfig {
  /** 默认时区 */
  defaultTimezone?: string;
  /** 是否自动检测用户时区 */
  autoDetect?: boolean;
  /** 自定义时区列表 */
  customTimezones?: TimezoneInfo[];
  /** 时区显示格式 */
  displayFormat?: 'offset' | 'abbr' | 'name';
}

export class TimezoneManager {
  private config: Required<TimezoneConfig>;
  private currentTimezone: string;
  private timezoneCache: Map<string, TimezoneInfo> = new Map();

  // 常用时区列表
  private static readonly COMMON_TIMEZONES: TimezoneInfo[] = [
    { id: 'UTC', name: 'Coordinated Universal Time', offset: 0, abbr: 'UTC' },
    { id: 'America/New_York', name: 'Eastern Time', offset: -300, abbr: 'EST', isDST: true },
    { id: 'America/Chicago', name: 'Central Time', offset: -360, abbr: 'CST', isDST: true },
    { id: 'America/Denver', name: 'Mountain Time', offset: -420, abbr: 'MST', isDST: true },
    { id: 'America/Los_Angeles', name: 'Pacific Time', offset: -480, abbr: 'PST', isDST: true },
    { id: 'Europe/London', name: 'Greenwich Mean Time', offset: 0, abbr: 'GMT', isDST: true },
    { id: 'Europe/Paris', name: 'Central European Time', offset: 60, abbr: 'CET', isDST: true },
    { id: 'Europe/Moscow', name: 'Moscow Time', offset: 180, abbr: 'MSK' },
    { id: 'Asia/Dubai', name: 'Gulf Standard Time', offset: 240, abbr: 'GST' },
    { id: 'Asia/Kolkata', name: 'India Standard Time', offset: 330, abbr: 'IST' },
    { id: 'Asia/Shanghai', name: 'China Standard Time', offset: 480, abbr: 'CST' },
    { id: 'Asia/Tokyo', name: 'Japan Standard Time', offset: 540, abbr: 'JST' },
    { id: 'Australia/Sydney', name: 'Australian Eastern Time', offset: 600, abbr: 'AEST', isDST: true },
  ];

  constructor(config: TimezoneConfig = {}) {
    this.config = {
      defaultTimezone: config.defaultTimezone || 'UTC',
      autoDetect: config.autoDetect !== false,
      customTimezones: config.customTimezones || [],
      displayFormat: config.displayFormat || 'abbr',
    };

    // 初始化时区
    this.currentTimezone = this.config.autoDetect
      ? this.detectUserTimezone()
      : this.config.defaultTimezone;

    // 缓存常用时区
    this.initializeTimezoneCache();
  }

  /**
   * 检测用户时区
   */
  private detectUserTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || this.config.defaultTimezone;
    } catch {
      return this.config.defaultTimezone;
    }
  }

  /**
   * 初始化时区缓存
   */
  private initializeTimezoneCache(): void {
    // 缓存常用时区
    TimezoneManager.COMMON_TIMEZONES.forEach(tz => {
      this.timezoneCache.set(tz.id, tz);
    });

    // 缓存自定义时区
    this.config.customTimezones.forEach(tz => {
      this.timezoneCache.set(tz.id, tz);
    });
  }

  /**
   * 获取当前时区
   */
  public getCurrentTimezone(): string {
    return this.currentTimezone;
  }

  /**
   * 设置当前时区
   */
  public setCurrentTimezone(timezone: string): void {
    if (this.isValidTimezone(timezone)) {
      this.currentTimezone = timezone;
    } else {
      throw new Error(`Invalid timezone: ${timezone}`);
    }
  }

  /**
   * 获取时区信息
   */
  public getTimezoneInfo(timezone: string): TimezoneInfo {
    // 先从缓存查找
    if (this.timezoneCache.has(timezone)) {
      return this.timezoneCache.get(timezone)!;
    }

    // 使用 Intl API 获取时区信息
    try {
      const date = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short',
      });

      const parts = formatter.formatToParts(date);
      const timeZonePart = parts.find(part => part.type === 'timeZoneName');
      const abbr = timeZonePart?.value || timezone;

      // 计算偏移量
      const offset = this.getTimezoneOffset(timezone, date);

      const info: TimezoneInfo = {
        id: timezone,
        name: timezone.replace(/_/g, ' '),
        offset,
        abbr,
      };

      // 缓存结果
      this.timezoneCache.set(timezone, info);
      return info;
    } catch (error) {
      throw new Error(`Failed to get timezone info for ${timezone}`);
    }
  }

  /**
   * 获取时区偏移量（分钟）
   */
  public getTimezoneOffset(timezone: string, date: Date = new Date()): number {
    try {
      // 创建指定时区的日期格式化器
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      // 格式化日期
      const parts = formatter.formatToParts(date);
      const dateParts: Record<string, string> = {};
      parts.forEach(part => {
        if (part.type !== 'literal') {
          dateParts[part.type] = part.value;
        }
      });

      // 构建时区日期
      const tzDate = new Date(
        `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
      );

      // 计算偏移量
      return (date.getTime() - tzDate.getTime()) / (1000 * 60);
    } catch {
      return 0;
    }
  }

  /**
   * 将日期转换到指定时区
   */
  public convertToTimezone(date: Date, fromTz: string, toTz: string): Date {
    if (fromTz === toTz) return new Date(date);

    // 获取偏移量差异
    const fromOffset = this.getTimezoneOffset(fromTz, date);
    const toOffset = this.getTimezoneOffset(toTz, date);
    const offsetDiff = toOffset - fromOffset;

    // 返回新日期
    return new Date(date.getTime() + offsetDiff * 60 * 1000);
  }

  /**
   * 将日期从当前时区转换到目标时区
   */
  public toTimezone(date: Date, timezone: string): Date {
    return this.convertToTimezone(date, this.currentTimezone, timezone);
  }

  /**
   * 将日期从指定时区转换到当前时区
   */
  public fromTimezone(date: Date, timezone: string): Date {
    return this.convertToTimezone(date, timezone, this.currentTimezone);
  }

  /**
   * 格式化日期为指定时区
   */
  public formatInTimezone(
    date: Date,
    timezone: string,
    format?: Intl.DateTimeFormatOptions
  ): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      ...format,
    };

    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  /**
   * 格式化日期（带时区信息）
   */
  public formatWithTimezone(date: Date, timezone?: string): string {
    const tz = timezone || this.currentTimezone;
    const tzInfo = this.getTimezoneInfo(tz);
    const formatted = this.formatInTimezone(date, tz);

    switch (this.config.displayFormat) {
      case 'offset':
        const offsetHours = Math.floor(Math.abs(tzInfo.offset) / 60);
        const offsetMinutes = Math.abs(tzInfo.offset) % 60;
        const offsetSign = tzInfo.offset >= 0 ? '+' : '-';
        const offsetStr = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
        return `${formatted} (UTC${offsetStr})`;
      case 'name':
        return `${formatted} (${tzInfo.name})`;
      case 'abbr':
      default:
        return `${formatted} (${tzInfo.abbr})`;
    }
  }

  /**
   * 验证时区是否有效
   */
  public isValidTimezone(timezone: string): boolean {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取所有可用时区
   */
  public getAvailableTimezones(): TimezoneInfo[] {
    const timezones: TimezoneInfo[] = [];

    // 添加常用时区
    timezones.push(...TimezoneManager.COMMON_TIMEZONES);

    // 添加自定义时区
    timezones.push(...this.config.customTimezones);

    // 去重
    const uniqueTimezones = new Map<string, TimezoneInfo>();
    timezones.forEach(tz => {
      uniqueTimezones.set(tz.id, tz);
    });

    return Array.from(uniqueTimezones.values()).sort((a, b) => a.offset - b.offset);
  }

  /**
   * 搜索时区
   */
  public searchTimezones(query: string): TimezoneInfo[] {
    const lowerQuery = query.toLowerCase();
    return this.getAvailableTimezones().filter(tz =>
      tz.id.toLowerCase().includes(lowerQuery) ||
      tz.name.toLowerCase().includes(lowerQuery) ||
      tz.abbr.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 获取时区组（按地区分组）
   */
  public getTimezoneGroups(): Map<string, TimezoneInfo[]> {
    const groups = new Map<string, TimezoneInfo[]>();

    this.getAvailableTimezones().forEach(tz => {
      const region = tz.id.split('/')[0];
      if (!groups.has(region)) {
        groups.set(region, []);
      }
      groups.get(region)!.push(tz);
    });

    return groups;
  }

  /**
   * 计算两个时区之间的时差
   */
  public getTimeDifference(timezone1: string, timezone2: string, date: Date = new Date()): number {
    const offset1 = this.getTimezoneOffset(timezone1, date);
    const offset2 = this.getTimezoneOffset(timezone2, date);
    return offset2 - offset1;
  }

  /**
   * 获取夏令时信息
   */
  public getDSTInfo(timezone: string): {
    isDST: boolean;
    nextTransition?: Date;
  } {
    const now = new Date();
    const winterOffset = this.getTimezoneOffset(timezone, new Date(now.getFullYear(), 0, 1));
    const summerOffset = this.getTimezoneOffset(timezone, new Date(now.getFullYear(), 6, 1));
    const currentOffset = this.getTimezoneOffset(timezone, now);

    const isDST = currentOffset !== winterOffset && winterOffset !== summerOffset;

    // TODO: 计算下一次夏令时转换
    return { isDST };
  }
}

/**
 * 创建时区管理器的单例实例
 */
let timezoneManagerInstance: TimezoneManager | null = null;

export function getTimezoneManager(config?: TimezoneConfig): TimezoneManager {
  if (!timezoneManagerInstance) {
    timezoneManagerInstance = new TimezoneManager(config);
  }
  return timezoneManagerInstance;
}

export function resetTimezoneManager(): void {
  timezoneManagerInstance = null;
}

