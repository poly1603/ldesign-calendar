/**
 * I18n - 国际化核心类
 * 提供多语言支持和消息格式化
 */

import type { Locale, I18nMessages } from '../types';
import { zhCN } from './locales/zh-CN';
import { enUS } from './locales/en-US';

export class I18n {
  private locale: Locale;
  private messages: Map<Locale, I18nMessages>;
  private fallbackLocale: Locale;

  constructor(locale: Locale = 'zh-CN', fallbackLocale: Locale = 'zh-CN') {
    this.locale = locale;
    this.fallbackLocale = fallbackLocale;
    this.messages = new Map();

    // 注册默认语言包
    this.registerMessages('zh-CN', zhCN);
    this.registerMessages('en-US', enUS);
  }

  /**
   * 设置当前语言
   */
  setLocale(locale: Locale): void {
    if (!this.messages.has(locale)) {
      console.warn(`Locale "${locale}" is not registered. Using fallback locale "${this.fallbackLocale}".`);
      this.locale = this.fallbackLocale;
      return;
    }
    this.locale = locale;
  }

  /**
   * 获取当前语言
   */
  getLocale(): Locale {
    return this.locale;
  }

  /**
   * 设置回退语言
   */
  setFallbackLocale(locale: Locale): void {
    this.fallbackLocale = locale;
  }

  /**
   * 获取回退语言
   */
  getFallbackLocale(): Locale {
    return this.fallbackLocale;
  }

  /**
   * 注册语言包
   */
  registerMessages(locale: Locale, messages: I18nMessages): void {
    this.messages.set(locale, messages);
  }

  /**
   * 获取语言包
   */
  getMessages(locale?: Locale): I18nMessages | undefined {
    return this.messages.get(locale || this.locale);
  }

  /**
   * 翻译文本
   * 支持参数替换: t('minutesBefore', { 0: 5 }) => "5分钟前"
   */
  t(key: string, params?: Record<string | number, any>): string {
    const messages = this.getMessages(this.locale);
    let text = messages?.[key];

    // 如果当前语言没有找到，尝试使用回退语言
    if (text === undefined) {
      const fallbackMessages = this.getMessages(this.fallbackLocale);
      text = fallbackMessages?.[key];
    }

    // 如果还是没有找到，返回 key 本身
    if (text === undefined) {
      console.warn(`Translation key "${key}" not found for locale "${this.locale}"`);
      return key;
    }

    // 参数替换
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        const regex = new RegExp(`\\{${param}\\}`, 'g');
        text = text.replace(regex, String(value));
      });
    }

    return text;
  }

  /**
   * 批量翻译
   */
  tAll(keys: string[]): Record<string, string> {
    const result: Record<string, string> = {};
    keys.forEach(key => {
      result[key] = this.t(key);
    });
    return result;
  }

  /**
   * 判断是否支持某个语言
   */
  hasLocale(locale: Locale): boolean {
    return this.messages.has(locale);
  }

  /**
   * 获取所有已注册的语言
   */
  getAvailableLocales(): Locale[] {
    return Array.from(this.messages.keys());
  }

  /**
   * 获取星期名称（完整）
   */
  getWeekdays(): string[] {
    return this.t('weekdays') as any;
  }

  /**
   * 获取星期名称（缩写）
   */
  getWeekdaysShort(): string[] {
    return this.t('weekdaysShort') as any;
  }

  /**
   * 获取星期名称（最小）
   */
  getWeekdaysMin(): string[] {
    return this.t('weekdaysMin') as any;
  }

  /**
   * 获取月份名称（完整）
   */
  getMonths(): string[] {
    return this.t('months') as any;
  }

  /**
   * 获取月份名称（缩写）
   */
  getMonthsShort(): string[] {
    return this.t('monthsShort') as any;
  }

  /**
   * 获取特定星期的名称
   */
  getWeekday(index: number, format: 'full' | 'short' | 'min' = 'full'): string {
    const weekdays = format === 'short' 
      ? this.getWeekdaysShort() 
      : format === 'min'
      ? this.getWeekdaysMin()
      : this.getWeekdays();
    
    return weekdays[index] || '';
  }

  /**
   * 获取特定月份的名称
   */
  getMonth(index: number, format: 'full' | 'short' = 'full'): string {
    const months = format === 'short' ? this.getMonthsShort() : this.getMonths();
    return months[index] || '';
  }

  /**
   * 格式化日期（使用当前语言的日期格式）
   */
  formatDate(date: Date): string {
    const dateFormat = this.t('dateFormat');
    // 这里应该使用 DateUtil.format，但为了避免循环依赖，暂时返回格式字符串
    return dateFormat;
  }

  /**
   * 格式化时间（使用当前语言的时间格式）
   */
  formatTime(date: Date): string {
    const timeFormat = this.t('timeFormat');
    return timeFormat;
  }

  /**
   * 格式化日期时间（使用当前语言的日期时间格式）
   */
  formatDateTime(date: Date): string {
    const dateTimeFormat = this.t('dateTimeFormat');
    return dateTimeFormat;
  }

  /**
   * 克隆 I18n 实例
   */
  clone(): I18n {
    const cloned = new I18n(this.locale, this.fallbackLocale);
    this.messages.forEach((messages, locale) => {
      cloned.registerMessages(locale, messages);
    });
    return cloned;
  }
}

// 创建默认实例
export const defaultI18n = new I18n();