/**
 * @ldesign/calendar - 国际化支持
 */

import type { I18nConfig, Locale } from './types';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

/**
 * 国际化管理器
 */
export class I18nManager {
  private locale: Locale;
  private locales: Map<string, Locale> = new Map();
  private fallbackLocale: string = 'zh-CN';

  constructor(config?: I18nConfig) {
    // 注册默认语言包
    this.register('zh-CN', zhCN);
    this.register('en-US', enUS);

    // 设置初始语言
    const initialLocale = config?.locale || this.detectLocale();
    this.locale = this.locales.get(initialLocale) || zhCN;

    if (config?.fallbackLocale) {
      this.fallbackLocale = config.fallbackLocale;
    }
  }

  /**
   * 检测浏览器语言
   */
  private detectLocale(): string {
    if (typeof navigator === 'undefined') {
      return 'zh-CN';
    }

    const browserLang = navigator.language || (navigator as any).userLanguage;

    // 简单的语言映射
    if (browserLang.startsWith('zh')) {
      return 'zh-CN';
    } else if (browserLang.startsWith('en')) {
      return 'en-US';
    }

    return 'zh-CN';
  }

  /**
   * 注册语言包
   */
  register(key: string, locale: Locale): void {
    this.locales.set(key, locale);
  }

  /**
   * 切换语言
   */
  setLocale(key: string): void {
    const locale = this.locales.get(key);
    if (locale) {
      this.locale = locale;
    } else {
      console.warn(`Locale "${key}" not found, falling back to ${this.fallbackLocale}`);
      this.locale = this.locales.get(this.fallbackLocale) || zhCN;
    }
  }

  /**
   * 获取当前语言包
   */
  getLocale(): Locale {
    return this.locale;
  }

  /**
   * 获取翻译文本
   */
  t(key: string, params?: Record<string, any>): string {
    const keys = key.split('.');
    let value: any = this.locale;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key "${key}" not found`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // 替换参数
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? String(params[param]) : match;
      });
    }

    return value;
  }

  /**
   * 格式化日期
   */
  formatDate(date: Date, format: 'short' | 'long' | 'full' = 'short'): string {
    const options = this.locale.dateFormats[format];
    return date.toLocaleDateString(this.locale.code, options);
  }

  /**
   * 格式化时间
   */
  formatTime(date: Date, format: 'short' | 'long' = 'short'): string {
    const options = this.locale.timeFormats[format];
    return date.toLocaleTimeString(this.locale.code, options);
  }

  /**
   * 格式化日期时间
   */
  formatDateTime(date: Date, dateFormat: 'short' | 'long' | 'full' = 'short', timeFormat: 'short' | 'long' = 'short'): string {
    return `${this.formatDate(date, dateFormat)} ${this.formatTime(date, timeFormat)}`;
  }

  /**
   * 获取月份名称
   */
  getMonthName(month: number, format: 'short' | 'long' = 'long'): string {
    return format === 'long' ? this.locale.months[month] : this.locale.monthsShort[month];
  }

  /**
   * 获取星期名称
   */
  getWeekdayName(weekday: number, format: 'short' | 'long' = 'long'): string {
    return format === 'long' ? this.locale.weekdays[weekday] : this.locale.weekdaysShort[weekday];
  }

  /**
   * 获取所有可用的语言
   */
  getAvailableLocales(): string[] {
    return Array.from(this.locales.keys());
  }
}

// 默认实例
let defaultI18n: I18nManager | null = null;

/**
 * 获取默认的 i18n 实例
 */
export function getI18n(): I18nManager {
  if (!defaultI18n) {
    defaultI18n = new I18nManager();
  }
  return defaultI18n;
}

/**
 * 设置默认的 i18n 实例
 */
export function setI18n(i18n: I18nManager): void {
  defaultI18n = i18n;
}

/**
 * 便捷翻译函数
 */
export function t(key: string, params?: Record<string, any>): string {
  return getI18n().t(key, params);
}

// 导出类型
export * from './types';

// 导出语言包
export { default as zhCN } from './locales/zh-CN';
export { default as enUS } from './locales/en-US';
