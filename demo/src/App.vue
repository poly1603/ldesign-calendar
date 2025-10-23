<template>
  <div class="demo-container">
    <!-- 头部 -->
    <header class="demo-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">📅</span>
          <h1>@ldesign/calendar</h1>
        </div>
        <div class="header-desc">
          <p>企业级日历组件 - 完整功能演示</p>
          <div class="badges">
            <span class="badge">Vue 3</span>
            <span class="badge">React</span>
            <span class="badge">Web Component</span>
            <span class="badge">TypeScript</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 选项卡 -->
    <div class="tabs">
      <button v-for="tab in tabs" :key="tab.id" :class="['tab', { active: currentTab === tab.id }]"
        @click="currentTab = tab.id">
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <VanillaDemo v-if="currentTab === 'vanilla'" />
      <VueDemo v-else-if="currentTab === 'vue'" />
      <ReactDemo v-else-if="currentTab === 'react'" />
      <WebComponentDemo v-else-if="currentTab === 'webcomponent'" />
      <FeaturesDemo v-else-if="currentTab === 'features'" />
    </div>

    <!-- 底部 -->
    <footer class="demo-footer">
      <p>
        Built with ❤️ by LDesign Team •
        <a href="https://github.com/ldesign/calendar" target="_blank">GitHub</a> •
        <a href="../README.md" target="_blank">文档</a>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VanillaDemo from './components/VanillaDemo.vue';
import VueDemo from './components/VueDemo.vue';
import ReactDemo from './components/ReactDemo.vue';
import WebComponentDemo from './components/WebComponentDemo.vue';
import FeaturesDemo from './components/FeaturesDemo.vue';

const currentTab = ref('vanilla');

const tabs = [
  { id: 'vanilla', label: 'Vanilla JS', icon: '🍦' },
  { id: 'vue', label: 'Vue 3', icon: '💚' },
  { id: 'react', label: 'React', icon: '⚛️' },
  { id: 'webcomponent', label: 'Web Component', icon: '🧩' },
  { id: 'features', label: '功能展示', icon: '✨' },
];
</script>

<style scoped>
.demo-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-header {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  font-size: 48px;
}

.logo h1 {
  font-size: 32px;
  color: #1890ff;
  margin: 0;
}

.header-desc p {
  color: #666;
  margin-bottom: 10px;
}

.badges {
  display: flex;
  gap: 8px;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.tabs {
  display: flex;
  gap: 8px;
  background: white;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
}

.tab:hover {
  background: #f5f5f5;
  color: #1890ff;
}

.tab.active {
  background: #1890ff;
  color: white;
}

.content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-height: 600px;
}

.demo-footer {
  text-align: center;
  color: white;
  padding: 20px;
  opacity: 0.9;
}

.demo-footer a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.demo-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .tabs {
    flex-direction: column;
  }

  .tab {
    width: 100%;
  }
}
</style>
