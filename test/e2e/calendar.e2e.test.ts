/**
 * 日历组件端到端测试
 */

import { test, expect, Page } from '@playwright/test';

// 测试页面 URL
const TEST_URL = 'http://localhost:3000/calendar-demo';

// 辅助函数：等待日历加载
async function waitForCalendarLoad(page: Page) {
  await page.waitForSelector('.ldesign-calendar', { timeout: 5000 });
  await page.waitForLoadState('networkidle');
}

// 辅助函数：获取当前视图
async function getCurrentView(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const viewButton = document.querySelector('.ldesign-calendar-toolbar__view-active');
    return viewButton?.textContent?.toLowerCase() || 'month';
  });
}

// 辅助函数：创建事件
async function createEvent(
  page: Page,
  title: string,
  date: string,
  time?: string
) {
  // 点击日期单元格
  await page.click(`[data-date="${date}"]`);
  
  // 等待事件创建对话框
  await page.waitForSelector('.ldesign-calendar-event-dialog');
  
  // 填写事件信息
  await page.fill('input[name="title"]', title);
  
  if (time) {
    await page.fill('input[name="time"]', time);
  }
  
  // 保存事件
  await page.click('button[data-action="save"]');
  
  // 等待对话框关闭
  await page.waitForSelector('.ldesign-calendar-event-dialog', { state: 'hidden' });
}

test.describe('日历基本功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL);
    await waitForCalendarLoad(page);
  });

  test('应该正确显示月视图', async ({ page }) => {
    // 验证月视图元素
    await expect(page.locator('.ldesign-calendar-month')).toBeVisible();
    await expect(page.locator('.ldesign-calendar-month__header')).toBeVisible();
    
    // 验证星期标题
    const weekDays = await page.$$('.ldesign-calendar-month__weekday');
    expect(weekDays).toHaveLength(7);
    
    // 验证日期单元格（6周 * 7天）
    const dateCells = await page.$$('.ldesign-calendar-month__cell');
    expect(dateCells.length).toBeGreaterThanOrEqual(35);
  });

  test('应该切换视图', async ({ page }) => {
    // 切换到周视图
    await page.click('button[data-view="week"]');
    await expect(page.locator('.ldesign-calendar-week')).toBeVisible();
    expect(await getCurrentView(page)).toBe('week');
    
    // 切换到日视图
    await page.click('button[data-view="day"]');
    await expect(page.locator('.ldesign-calendar-day')).toBeVisible();
    expect(await getCurrentView(page)).toBe('day');
    
    // 切换到议程视图
    await page.click('button[data-view="agenda"]');
    await expect(page.locator('.ldesign-calendar-agenda')).toBeVisible();
    expect(await getCurrentView(page)).toBe('agenda');
    
    // 切换回月视图
    await page.click('button[data-view="month"]');
    await expect(page.locator('.ldesign-calendar-month')).toBeVisible();
  });

  test('应该导航到不同日期', async ({ page }) => {
    // 获取当前月份
    const currentMonth = await page.textContent('.ldesign-calendar-toolbar__title');
    
    // 下一月
    await page.click('button[data-action="next"]');
    await page.waitForTimeout(300); // 等待动画
    const nextMonth = await page.textContent('.ldesign-calendar-toolbar__title');
    expect(nextMonth).not.toBe(currentMonth);
    
    // 上一月
    await page.click('button[data-action="prev"]');
    await page.click('button[data-action="prev"]');
    await page.waitForTimeout(300);
    const prevMonth = await page.textContent('.ldesign-calendar-toolbar__title');
    expect(prevMonth).not.toBe(currentMonth);
    
    // 今天
    await page.click('button[data-action="today"]');
    await page.waitForTimeout(300);
    const todayMonth = await page.textContent('.ldesign-calendar-toolbar__title');
    expect(todayMonth).toBe(currentMonth);
  });
});

test.describe('事件管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL);
    await waitForCalendarLoad(page);
  });

  test('应该创建新事件', async ({ page }) => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    await createEvent(page, '测试事件', dateStr, '14:00');
    
    // 验证事件显示
    await expect(page.locator('.ldesign-calendar-event').filter({ hasText: '测试事件' })).toBeVisible();
  });

  test('应该编辑事件', async ({ page }) => {
    // 先创建一个事件
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    await createEvent(page, '原始事件', dateStr);
    
    // 点击事件
    await page.click('.ldesign-calendar-event:has-text("原始事件")');
    
    // 等待编辑对话框
    await page.waitForSelector('.ldesign-calendar-event-dialog');
    
    // 修改标题
    await page.fill('input[name="title"]', '修改后的事件');
    
    // 保存
    await page.click('button[data-action="save"]');
    
    // 验证更新
    await expect(page.locator('.ldesign-calendar-event').filter({ hasText: '修改后的事件' })).toBeVisible();
    await expect(page.locator('.ldesign-calendar-event').filter({ hasText: '原始事件' })).not.toBeVisible();
  });

  test('应该删除事件', async ({ page }) => {
    // 先创建一个事件
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    await createEvent(page, '待删除事件', dateStr);
    
    // 点击事件
    await page.click('.ldesign-calendar-event:has-text("待删除事件")');
    
    // 等待编辑对话框
    await page.waitForSelector('.ldesign-calendar-event-dialog');
    
    // 删除
    await page.click('button[data-action="delete"]');
    
    // 确认删除
    await page.click('button[data-action="confirm"]');
    
    // 验证事件已删除
    await expect(page.locator('.ldesign-calendar-event').filter({ hasText: '待删除事件' })).not.toBeVisible();
  });

  test('应该支持全天事件', async ({ page }) => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // 创建全天事件
    await page.click(`[data-date="${dateStr}"]`);
    await page.waitForSelector('.ldesign-calendar-event-dialog');
    
    await page.fill('input[name="title"]', '全天事件');
    await page.check('input[name="allDay"]');
    await page.click('button[data-action="save"]');
    
    // 验证全天事件标记
    const event = page.locator('.ldesign-calendar-event').filter({ hasText: '全天事件' });
    await expect(event).toBeVisible();
    await expect(event).toHaveClass(/all-day/);
  });
});

test.describe('拖拽功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL);
    await waitForCalendarLoad(page);
  });

  test('应该拖拽移动事件', async ({ page }) => {
    // 创建事件
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    await createEvent(page, '可拖拽事件', dateStr);
    
    // 获取事件元素
    const event = page.locator('.ldesign-calendar-event').filter({ hasText: '可拖拽事件' });
    
    // 获取目标日期（明天）
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const targetCell = page.locator(`[data-date="${tomorrowStr}"]`);
    
    // 执行拖拽
    await event.dragTo(targetCell);
    
    // 验证事件移动到新日期
    await expect(targetCell.locator('.ldesign-calendar-event').filter({ hasText: '可拖拽事件' })).toBeVisible();
  });

  test('应该拖拽调整事件大小', async ({ page }) => {
    // 切换到周视图
    await page.click('button[data-view="week"]');
    
    // 创建事件
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    await createEvent(page, '可调整事件', dateStr, '10:00');
    
    // 获取事件的调整手柄
    const event = page.locator('.ldesign-calendar-event').filter({ hasText: '可调整事件' });
    const resizeHandle = event.locator('.ldesign-calendar-event__resize-handle');
    
    // 拖拽调整大小
    const box = await event.boundingBox();
    if (box) {
      await resizeHandle.dragTo(event, {
        targetPosition: { x: box.width / 2, y: box.height + 50 }
      });
    }
    
    // 验证事件时长改变
    await page.waitForTimeout(500);
    const newBox = await event.boundingBox();
    expect(newBox?.height).toBeGreaterThan(box?.height || 0);
  });
});

test.describe('搜索和过滤', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL);
    await waitForCalendarLoad(page);
    
    // 创建测试事件
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      await createEvent(page, `事件 ${i + 1}`, dateStr);
    }
  });

  test('应该搜索事件', async ({ page }) => {
    // 打开搜索
    await page.click('button[data-action="search"]');
    await page.waitForSelector('.ldesign-calendar-search');
    
    // 输入搜索关键词
    await page.fill('input[name="search"]', '事件 3');
    await page.waitForTimeout(500); // 等待搜索
    
    // 验证搜索结果
    const visibleEvents = await page.$$('.ldesign-calendar-event:visible');
    expect(visibleEvents).toHaveLength(1);
    
    const eventText = await page.textContent('.ldesign-calendar-event:visible');
    expect(eventText).toContain('事件 3');
  });

  test('应该应用日期过滤', async ({ page }) => {
    // 打开过滤面板
    await page.click('button[data-action="filter"]');
    await page.waitForSelector('.ldesign-calendar-filter');
    
    // 选择今天
    await page.click('input[value="today"]');
    await page.click('button[data-action="apply-filter"]');
    
    // 验证只显示今天的事件
    const visibleEvents = await page.$$('.ldesign-calendar-event:visible');
    expect(visibleEvents).toHaveLength(1);
    
    const eventText = await page.textContent('.ldesign-calendar-event:visible');
    expect(eventText).toContain('事件 1');
  });
});

test.describe('导入导出', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL);
    await waitForCalendarLoad(page);
  });

  test('应该导出事件为 iCal', async ({ page }) => {
    // 创建测试事件
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    await createEvent(page, '导出测试事件', dateStr);
    
    // 打开导出对话框
    await page.click('button[data-action="export"]');
    await page.waitForSelector('.ldesign-calendar-export-dialog');
    
    // 选择 iCal 格式
    await page.selectOption('select[name="format"]', 'ical');
    
    // 设置下载监听器
    const downloadPromise = page.waitForEvent('download');
    
    // 点击导出
    await page.click('button[data-action="export-confirm"]');
    
    // 验证下载
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.ics');
  });

  test('应该导入 CSV 文件', async ({ page }) => {
    // 打开导入对话框
    await page.click('button[data-action="import"]');
    await page.waitForSelector('.ldesign-calendar-import-dialog');
    
    // 创建测试 CSV 内容
    const csvContent = `ID,Title,Start,End,All Day,Description,Location
test-1,导入的事件,2024-01-20T10:00:00,2024-01-20T11:00:00,FALSE,测试描述,会议室`;
    
    // 设置文件输入
    await page.setInputFiles('input[type="file"]', {
      name: 'events.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });
    
    // 确认导入
    await page.click('button[data-action="import-confirm"]');
    
    // 等待导入完成
    await page.waitForSelector('.ldesign-calendar-import-success');
    
    // 验证事件已导入
    await expect(page.locator('.ldesign-calendar-event').filter({ hasText: '导入的事件' })).toBeVisible();
  });
});

test.describe('打印功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL);
    await waitForCalendarLoad(page);
  });

  test('应该显示打印预览', async ({ page }) => {
    // 创建测试事件
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    await createEvent(page, '打印测试事件', dateStr);
    
    // 打开打印预览
    await page.click('button[data-action="print"]');
    
    // 等待新窗口
    const [previewPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('button[data-action="print-preview"]'),
    ]);
    
    // 验证预览窗口
    await previewPage.waitForLoadState();
    await expect(previewPage.locator('.print-preview-container')).toBeVisible();
    await expect(previewPage.locator('.print-month-table')).toBeVisible();
    
    // 验证事件在预览中显示
    const eventInPreview = await previewPage.textContent('.print-event');
    expect(eventInPreview).toContain('打印测试事件');
    
    await previewPage.close();
  });
});

test.describe('响应式设计', () => {
  test('应该适应移动端视图', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(TEST_URL);
    await waitForCalendarLoad(page);
    
    // 验证移动端布局
    await expect(page.locator('.ldesign-calendar--mobile')).toBeVisible();
    
    // 验证汉堡菜单
    await expect(page.locator('.ldesign-calendar-toolbar__menu-toggle')).toBeVisible();
    
    // 打开菜单
    await page.click('.ldesign-calendar-toolbar__menu-toggle');
    await expect(page.locator('.ldesign-calendar-mobile-menu')).toBeVisible();
  });

  test('应该适应平板视图', async ({ page }) => {
    // 设置平板视口
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto(TEST_URL);
    await waitForCalendarLoad(page);
    
    // 验证平板布局
    await expect(page.locator('.ldesign-calendar--tablet')).toBeVisible();
    
    // 验证侧边栏
    await expect(page.locator('.ldesign-calendar-sidebar')).toBeVisible();
  });
});

test.describe('无障碍性', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL);
    await waitForCalendarLoad(page);
  });

  test('应该支持键盘导航', async ({ page }) => {
    // Focus on calendar
    await page.focus('.ldesign-calendar');
    
    // 使用方向键导航
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    
    // 验证焦点移动
    const focusedElement = await page.evaluate(() => document.activeElement?.className);
    expect(focusedElement).toContain('ldesign-calendar');
    
    // 使用Enter选择日期
    await page.keyboard.press('Enter');
    await page.waitForSelector('.ldesign-calendar-event-dialog');
    
    // 使用Escape关闭对话框
    await page.keyboard.press('Escape');
    await page.waitForSelector('.ldesign-calendar-event-dialog', { state: 'hidden' });
  });

  test('应该有正确的ARIA属性', async ({ page }) => {
    // 验证主容器ARIA属性
    const calendar = page.locator('.ldesign-calendar');
    await expect(calendar).toHaveAttribute('role', 'application');
    await expect(calendar).toHaveAttribute('aria-label', /日历/);
    
    // 验证日期单元格ARIA属性
    const dateCell = page.locator('.ldesign-calendar-month__cell').first();
    await expect(dateCell).toHaveAttribute('role', 'gridcell');
    await expect(dateCell).toHaveAttribute('aria-label');
    
    // 验证按钮ARIA属性
    const todayButton = page.locator('button[data-action="today"]');
    await expect(todayButton).toHaveAttribute('aria-label', '今天');
  });

  test('应该支持屏幕阅读器', async ({ page }) => {
    // 验证实时区域
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeAttached();
    
    // 导航时应更新实时区域
    await page.click('button[data-action="next"]');
    await page.waitForTimeout(100);
    
    const announcement = await liveRegion.textContent();
    expect(announcement).toBeTruthy();
  });
});

test.describe('性能测试', () => {
  test('应该快速渲染大量事件', async ({ page }) => {
    await page.goto(TEST_URL);
    await waitForCalendarLoad(page);
    
    // 通过API添加大量事件
    await page.evaluate(() => {
      const calendar = (window as any).calendar;
      const events = [];
      const startDate = new Date();
      
      for (let i = 0; i < 1000; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + Math.floor(i / 10));
        
        events.push({
          id: `event-${i}`,
          title: `Event ${i}`,
          start: new Date(date),
          end: new Date(date.getTime() + 3600000),
        });
      }
      
      calendar.addEvents(events);
    });
    
    // 测量渲染时间
    const startTime = Date.now();
    await page.waitForSelector('.ldesign-calendar-event');
    const endTime = Date.now();
    
    // 验证渲染时间小于2秒
    expect(endTime - startTime).toBeLessThan(2000);
    
    // 验证滚动性能
    await page.evaluate(() => {
      const container = document.querySelector('.ldesign-calendar-month');
      if (container) {
        container.scrollTop = 1000;
      }
    });
    
    // 验证滚动流畅
    await page.waitForTimeout(100);
    const scrollTop = await page.evaluate(() => {
      const container = document.querySelector('.ldesign-calendar-month');
      return container?.scrollTop || 0;
    });
    expect(scrollTop).toBeGreaterThan(0);
  });
});
