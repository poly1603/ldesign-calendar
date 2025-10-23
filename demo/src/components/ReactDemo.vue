<template>
  <div class="demo-section">
    <h2>⚛️ React 示例</h2>
    <p class="desc">React 组件和 Hook 的使用方式</p>

    <div class="code-section">
      <h3>组件方式</h3>
      <pre><code>{{ componentCode }}</code></pre>
    </div>

    <div class="code-section">
      <h3>Hook 方式</h3>
      <pre><code>{{ hookCode }}</code></pre>
    </div>

    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">🎯</div>
        <h3>TypeScript 支持</h3>
        <p>完整的类型定义，智能提示</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3>性能优化</h3>
        <p>虚拟 DOM + Canvas 混合渲染</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎨</div>
        <h3>主题定制</h3>
        <p>灵活的样式系统</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📱</div>
        <h3>响应式</h3>
        <p>完美适配移动端</p>
      </div>
    </div>

    <div class="note">
      <p><strong>注意：</strong>React 示例需要在 React 项目中运行。</p>
      <p>本演示项目基于 Vue 3，这里仅展示代码示例。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const componentCode = `import React, { useRef } from 'react';
import { Calendar } from '@ldesign/calendar/react';
import '@ldesign/calendar/dist/calendar.css';

function App() {
  const calendarRef = useRef(null);

  const handleEventClick = (event) => {
    console.log('点击事件:', event);
  };

  const handleDateSelect = async (start, end) => {
    await calendarRef.current?.addEvent({
      title: '新事件',
      start,
      end,
    });
  };

  return (
    <Calendar
      ref={calendarRef}
      config={{ 
        initialView: 'month',
        editable: true 
      }}
      onEventClick={handleEventClick}
      onDateSelect={handleDateSelect}
    />
  );
}`;

const hookCode = `import { useCalendar } from '@ldesign/calendar/react';

function App() {
  const {
    calendarRef,
    events,
    addEvent,
    changeView,
    next,
    prev,
    today,
  } = useCalendar({
    initialView: 'month',
    editable: true,
  });

  return (
    <div>
      <div ref={calendarRef} />
      <p>事件数: {events.length}</p>
      <button onClick={today}>今天</button>
      <button onClick={prev}>上一个</button>
      <button onClick={next}>下一个</button>
    </div>
  );
}`;
</script>

<style scoped>
.demo-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h2 {
  color: #262626;
  margin: 0;
}

.desc {
  color: #8c8c8c;
  margin: 0;
}

.code-section {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
}

.code-section h3 {
  margin: 0 0 10px 0;
  color: #595959;
  font-size: 14px;
}

pre {
  margin: 0;
  overflow-x: auto;
}

code {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #262626;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature-card {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  text-align: center;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.feature-card h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.feature-card p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.note {
  background: #fff7e6;
  border-left: 4px solid #faad14;
  padding: 16px;
  border-radius: 4px;
}

.note p {
  margin: 0;
  color: #8c8c8c;
  line-height: 1.6;
}

.note p:not(:last-child) {
  margin-bottom: 8px;
}

.note strong {
  color: #262626;
}
</style>
