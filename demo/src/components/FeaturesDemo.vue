<template>
  <div class="demo-section">
    <h2>✨ 功能展示</h2>
    <p class="desc">完整功能清单与特性说明</p>

    <div class="features">
      <div class="feature-category">
        <h3>🗓️ 视图系统</h3>
        <div class="feature-list">
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>月视图</strong>
              <p>6周网格布局，清晰展示整月事件</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>周视图</strong>
              <p>时间轴 + 7列日期，精确到分钟</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>日视图</strong>
              <p>单日详细视图，事件详情一览无余</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>议程视图</strong>
              <p>列表模式，快速浏览事件清单</p>
            </div>
          </div>
        </div>
      </div>

      <div class="feature-category">
        <h3>📝 事件管理</h3>
        <div class="feature-list">
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>完整 CRUD</strong>
              <p>创建、读取、更新、删除</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>全天事件</strong>
              <p>支持全天事件标记</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>事件搜索</strong>
              <p>按标题、描述、地点搜索</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>事件验证</strong>
              <p>自动验证事件数据完整性</p>
            </div>
          </div>
        </div>
      </div>

      <div class="feature-category">
        <h3>🔄 重复事件</h3>
        <div class="feature-list">
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>多种频率</strong>
              <p>每天/每周/每月/每年</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>自定义间隔</strong>
              <p>每 N 天重复</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>指定星期</strong>
              <p>每周一、三、五</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>RRULE 支持</strong>
              <p>标准重复规则</p>
            </div>
          </div>
        </div>
      </div>

      <div class="feature-category">
        <h3>🖱️ 交互功能</h3>
        <div class="feature-list">
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>拖拽移动</strong>
              <p>直接拖拽事件到新日期</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>调整大小</strong>
              <p>拖拽边缘调整事件时长</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>拖拽创建</strong>
              <p>在空白处拖拽创建新事件</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>丰富回调</strong>
              <p>事件点击、日期选择等</p>
            </div>
          </div>
        </div>
      </div>

      <div class="feature-category">
        <h3>💾 存储系统</h3>
        <div class="feature-list">
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>LocalStorage</strong>
              <p>离线存储，自动持久化</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>API 适配器</strong>
              <p>轻松对接后端接口</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>自定义适配器</strong>
              <p>灵活扩展存储方案</p>
            </div>
          </div>
        </div>
      </div>

      <div class="feature-category">
        <h3>🎨 渲染引擎</h3>
        <div class="feature-list">
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>混合渲染</strong>
              <p>DOM + Canvas 混合模式</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>高性能</strong>
              <p>Canvas 加速，支持大量事件</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>响应式</strong>
              <p>完美适配移动端</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="check">✅</span>
            <div>
              <strong>高 DPI</strong>
              <p>自动处理 Retina 屏幕</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="roadmap">
      <h3>🚀 未来规划 (v0.2.0)</h3>
      <div class="roadmap-list">
        <div class="roadmap-item">🎯 资源视图（Resource View）</div>
        <div class="roadmap-item">📅 iCal 导入/导出</div>
        <div class="roadmap-item">🔔 事件提醒</div>
        <div class="roadmap-item">🌍 更完善的时区支持</div>
        <div class="roadmap-item">⚡ 虚拟滚动</div>
        <div class="roadmap-item">🤝 实时协作</div>
        <div class="roadmap-item">🤖 AI 智能助手</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

h2 {
  color: #262626;
  margin: 0;
}

h3 {
  color: #262626;
  margin: 0 0 16px 0;
  font-size: 20px;
}

.desc {
  color: #8c8c8c;
  margin: 0;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.feature-category {
  background: #fafafa;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.check {
  font-size: 18px;
  flex-shrink: 0;
}

.feature-item strong {
  display: block;
  color: #262626;
  margin-bottom: 4px;
  font-size: 15px;
}

.feature-item p {
  margin: 0;
  color: #8c8c8c;
  font-size: 13px;
  line-height: 1.5;
}

.roadmap {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  border-radius: 12px;
  color: white;
}

.roadmap h3 {
  color: white;
}

.roadmap-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.roadmap-item {
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
  }
}
</style>
