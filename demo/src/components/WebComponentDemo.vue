<template>
  <div class="demo-section">
    <h2>🧩 Web Component 示例</h2>
    <p class="desc">标准自定义元素，可在任何环境使用</p>

    <div class="code-section">
      <h3>HTML 使用</h3>
      <pre><code>{{ htmlCode }}</code></pre>
    </div>

    <div class="code-section">
      <h3>JavaScript 使用</h3>
      <pre><code>{{ jsCode }}</code></pre>
    </div>

    <div class="advantages">
      <h3>Web Component 优势</h3>
      <ul>
        <li>✅ <strong>框架无关</strong> - 可在任何框架或无框架环境使用</li>
        <li>✅ <strong>标准化</strong> - 基于 Web Components 标准</li>
        <li>✅ <strong>封装性</strong> - 完全封装，避免样式冲突</li>
        <li>✅ <strong>易用性</strong> - 像普通 HTML 元素一样使用</li>
        <li>✅ <strong>互操作性</strong> - 可与其他组件无缝集成</li>
      </ul>
    </div>

    <div class="compatibility">
      <h3>浏览器兼容性</h3>
      <div class="browser-grid">
        <div class="browser-item">
          <span class="browser-icon">🌐</span>
          <div>Chrome 67+</div>
        </div>
        <div class="browser-item">
          <span class="browser-icon">🦊</span>
          <div>Firefox 63+</div>
        </div>
        <div class="browser-item">
          <span class="browser-icon">🧭</span>
          <div>Safari 10.1+</div>
        </div>
        <div class="browser-item">
          <span class="browser-icon">🌊</span>
          <div>Edge 79+</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const htmlCode = `<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import '@ldesign/calendar/webcomponent';
  </script>
</head>

<body>
  <ldesign-calendar 
    view="month"
    editable="true"
    selectable="true"
  ></ldesign-calendar>
</body>

</html>`;

const jsCode = `// 导入 Web Component
import '@ldesign/calendar/webcomponent';

// 获取元素
const calendar = document.querySelector('ldesign-calendar');

// 监听事件
calendar.addEventListener('event-click', (e) => {
console.log('点击事件:', e.detail);
});

calendar.addEventListener('date-select', (e) => {
const { start, end } = e.detail;
calendar.addEvent({
title: '新事件',
start,
end,
});
});

// 调用方法
calendar.addEvent({
title: '团队会议',
start: new Date(2024, 0, 15, 10, 0),
end: new Date(2024, 0, 15, 11, 30),
});

calendar.changeView('week');
calendar.today();`;
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

h3 {
  color: #262626;
  margin: 0 0 12px 0;
  font-size: 18px;
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
  font-size: 14px;
  color: #595959;
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

.advantages {
  background: #e6f7ff;
  border-left: 4px solid #1890ff;
  padding: 20px;
  border-radius: 4px;
}

.advantages ul {
  margin: 12px 0 0 0;
  padding-left: 20px;
}

.advantages li {
  margin: 8px 0;
  color: #262626;
  line-height: 1.6;
}

.compatibility {
  background: #f6ffed;
  border-left: 4px solid #52c41a;
  padding: 20px;
  border-radius: 4px;
}

.browser-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 12px;
}

.browser-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.browser-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.browser-item div {
  font-size: 14px;
  color: #595959;
  font-weight: 500;
}
</style>
