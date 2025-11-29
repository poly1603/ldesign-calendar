/**
 * ThemeManager - 主题管理系统
 * 支持主题切换和 CSS 变量定制
 */

import type { Theme, ThemeVariables } from '../types';

export class ThemeManager {
  private themes: Map<string, Theme>;
  private currentTheme: string;
  private customVariables: Partial<ThemeVariables>;

  // 默认主题
  static readonly DEFAULT_THEME: Theme = {
    name: 'default',
    variables: {
      primaryColor: '#1890ff',
      backgroundColor: '#ffffff',
      textColor: '#262626',
      textSecondaryColor: '#8c8c8c',
      borderColor: '#e8e8e8',
      hoverColor: '#f5f5f5',
      selectedColor: '#1890ff',
      selectedTextColor: '#ffffff',
      disabledColor: '#f5f5f5',
      disabledTextColor: '#bfbfbf',
      todayColor: '#ff4d4f',
      weekendColor: '#ff7875',
      cellWidth: '40px',
      cellHeight: '40px',
      fontSize: '14px',
      fontSizeSmall: '12px',
      borderRadius: '4px',
      spacing: '8px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease',
    },
  };

  // 暗色主题
  static readonly DARK_THEME: Theme = {
    name: 'dark',
    variables: {
      primaryColor: '#177ddc',
      backgroundColor: '#141414',
      textColor: '#e8e8e8',
      textSecondaryColor: '#8c8c8c',
      borderColor: '#434343',
      hoverColor: '#262626',
      selectedColor: '#177ddc',
      selectedTextColor: '#ffffff',
      disabledColor: '#1f1f1f',
      disabledTextColor: '#595959',
      todayColor: '#ff7875',
      weekendColor: '#ff9c6e',
      cellWidth: '40px',
      cellHeight: '40px',
      fontSize: '14px',
      fontSizeSmall: '12px',
      borderRadius: '4px',
      spacing: '8px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
      transition: 'all 0.3s ease',
    },
  };

  // 亮色主题
  static readonly LIGHT_THEME: Theme = {
    name: 'light',
    variables: {
      primaryColor: '#1890ff',
      backgroundColor: '#fafafa',
      textColor: '#000000',
      textSecondaryColor: '#737373',
      borderColor: '#d9d9d9',
      hoverColor: '#f0f0f0',
      selectedColor: '#1890ff',
      selectedTextColor: '#ffffff',
      disabledColor: '#f5f5f5',
      disabledTextColor: '#bfbfbf',
      todayColor: '#ff4d4f',
      weekendColor: '#ff7875',
      cellWidth: '40px',
      cellHeight: '40px',
      fontSize: '14px',
      fontSizeSmall: '12px',
      borderRadius: '4px',
      spacing: '8px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
    },
  };

  constructor(initialTheme: string = 'default') {
    this.themes = new Map();
    this.customVariables = {};
    
    // 注册内置主题
    this.registerTheme(ThemeManager.DEFAULT_THEME);
    this.registerTheme(ThemeManager.DARK_THEME);
    this.registerTheme(ThemeManager.LIGHT_THEME);
    
    this.currentTheme = initialTheme;
  }

  /**
   * 注册主题
   */
  registerTheme(theme: Theme): void {
    this.themes.set(theme.name, theme);
  }

  /**
   * 批量注册主题
   */
  registerThemes(themes: Theme[]): void {
    themes.forEach(theme => this.registerTheme(theme));
  }

  /**
   * 设置当前主题
   */
  setTheme(name: string): void {
    if (!this.themes.has(name)) {
      console.warn(`Theme "${name}" is not registered. Using current theme "${this.currentTheme}".`);
      return;
    }
    this.currentTheme = name;
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): Theme {
    const theme = this.themes.get(this.currentTheme);
    if (!theme) {
      return ThemeManager.DEFAULT_THEME;
    }

    // 合并自定义变量
    if (Object.keys(this.customVariables).length > 0) {
      return {
        ...theme,
        variables: {
          ...theme.variables,
          ...this.customVariables,
        },
      };
    }

    return theme;
  }

  /**
   * 获取当前主题名称
   */
  getCurrentThemeName(): string {
    return this.currentTheme;
  }

  /**
   * 获取主题
   */
  getTheme(name: string): Theme | undefined {
    return this.themes.get(name);
  }

  /**
   * 获取所有主题名称
   */
  getThemeNames(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * 判断主题是否存在
   */
  hasTheme(name: string): boolean {
    return this.themes.has(name);
  }

  /**
   * 应用自定义主题变量
   */
  applyThemeVariables(variables: Partial<ThemeVariables>): void {
    this.customVariables = {
      ...this.customVariables,
      ...variables,
    };
  }

  /**
   * 重置自定义变量
   */
  resetCustomVariables(): void {
    this.customVariables = {};
  }

  /**
   * 重置主题
   */
  resetTheme(): void {
    this.currentTheme = 'default';
    this.resetCustomVariables();
  }

  /**
   * 获取主题变量
   */
  getThemeVariables(): ThemeVariables {
    return this.getCurrentTheme().variables;
  }

  /**
   * 获取特定主题变量
   */
  getThemeVariable(key: keyof ThemeVariables): string {
    return this.getThemeVariables()[key];
  }

  /**
   * 生成 CSS 变量字符串
   */
  toCSSVariables(prefix: string = '--calendar'): string {
    const variables = this.getThemeVariables();
    let css = '';

    Object.entries(variables).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `${prefix}-${cssKey}: ${value};\n`;
    });

    return css;
  }

  /**
   * 生成 CSS 变量对象（用于内联样式）
   */
  toCSSVariablesObject(prefix: string = '--calendar'): Record<string, string> {
    const variables = this.getThemeVariables();
    const obj: Record<string, string> = {};

    Object.entries(variables).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      obj[`${prefix}-${cssKey}`] = value;
    });

    return obj;
  }

  /**
   * 应用主题到 DOM 元素
   */
  applyToDOMElement(element: HTMLElement, prefix: string = '--calendar'): void {
    const variables = this.toCSSVariablesObject(prefix);
    
    Object.entries(variables).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
  }

  /**
   * 从 DOM 元素移除主题
   */
  removeFromDOMElement(element: HTMLElement, prefix: string = '--calendar'): void {
    const variables = this.toCSSVariablesObject(prefix);
    
    Object.keys(variables).forEach(key => {
      element.style.removeProperty(key);
    });
  }

  /**
   * 创建主题样式标签
   */
  createStyleTag(selector: string = ':root', prefix: string = '--calendar'): HTMLStyleElement {
    const style = document.createElement('style');
    const css = `${selector} {\n${this.toCSSVariables(prefix)}}`;
    style.textContent = css;
    return style;
  }

  /**
   * 导出主题为 JSON
   */
  exportThemeToJSON(themeName?: string): string {
    const theme = themeName ? this.getTheme(themeName) : this.getCurrentTheme();
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found`);
    }
    return JSON.stringify(theme, null, 2);
  }

  /**
   * 从 JSON 导入主题
   */
  importThemeFromJSON(jsonData: string): void {
    try {
      const theme = JSON.parse(jsonData) as Theme;
      this.registerTheme(theme);
    } catch (error) {
      console.error('Failed to import theme from JSON:', error);
      throw new Error('Invalid JSON data');
    }
  }

  /**
   * 克隆实例
   */
  clone(): ThemeManager {
    const cloned = new ThemeManager(this.currentTheme);
    
    // 复制所有主题
    this.themes.forEach((theme, name) => {
      if (!['default', 'dark', 'light'].includes(name)) {
        cloned.registerTheme({ ...theme });
      }
    });
    
    // 复制自定义变量
    cloned.applyThemeVariables({ ...this.customVariables });
    
    return cloned;
  }

  /**
   * 创建主题变体（基于现有主题）
   */
  createThemeVariant(baseName: string, variantName: string, overrides: Partial<ThemeVariables>): Theme {
    const baseTheme = this.getTheme(baseName);
    if (!baseTheme) {
      throw new Error(`Base theme "${baseName}" not found`);
    }

    const variant: Theme = {
      name: variantName,
      variables: {
        ...baseTheme.variables,
        ...overrides,
      },
    };

    this.registerTheme(variant);
    return variant;
  }
}