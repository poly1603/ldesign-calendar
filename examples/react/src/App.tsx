import React, { useState, useRef, useEffect } from 'react';
import { Calendar, useCalendar } from '@ldesign/calendar-react';
import type { CalendarRef, CalendarEvent } from '@ldesign/calendar-react';
import './App.css';

function App() {
  // 使用 Hook
  const {
    events,
    currentView,
    currentDate,
    changeView,
    next,
    prev,
    today,
    addEvent,
    deleteEvent,
  } = useCalendar({
    initialView: 'month',
    editable: true,
    selectable: true,
    firstDayOfWeek: 1,
  });

  // 状态
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    description: '',
  });

  // 统计
  const upcomingCount = events.filter((e) => e.start > new Date()).length;
  const pastCount = events.filter((e) => e.end < new Date()).length;

  // 事件处理
  const handleEventClick = (event: CalendarEvent) => {
    if (
      window.confirm(
        `事件: ${event.title}\n开始: ${event.start.toLocaleString()}\n结束: ${event.end.toLocaleString()}\n\n是否删除？`
      )
    ) {
      deleteEvent(event.id);
    }
  };

  const handleDateSelect = (start: Date, end: Date) => {
    setFormData({
      title: '',
      start: start.toISOString().slice(0, 16),
      end: end.toISOString().slice(0, 16),
      description: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const colors = ['#3788d8', '#ff6b6b', '#51cf66', '#ffd43b', '#a78bfa'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    try {
      await addEvent({
        title: formData.title,
        start: new Date(formData.start),
        end: new Date(formData.end),
        description: formData.description,
        color,
      });

      setShowModal(false);
      setFormData({ title: '', start: '', end: '', description: '' });
    } catch (error) {
      alert('添加事件失败: ' + (error as Error).message);
    }
  };

  const showAddModal = () => {
    const now = new Date();
    const end = new Date(now.getTime() + 60 * 60 * 1000);

    setFormData({
      title: '',
      start: now.toISOString().slice(0, 16),
      end: end.toISOString().slice(0, 16),
      description: '',
    });
    setShowModal(true);
  };

  // 添加示例事件
  useEffect(() => {
    const today = new Date();
    const sampleEvents = [
      {
        title: '团队会议',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
        color: '#3788d8',
      },
      {
        title: '午餐约会',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
        color: '#ff6b6b',
      },
      {
        title: '代码评审',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 30),
        color: '#51cf66',
      },
    ];

    (async () => {
      for (const event of sampleEvents) {
        try {
          await addEvent(event);
        } catch (error) {
          console.error('Failed to add sample event:', error);
        }
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      <div className="header">
        <h1>📅 @ldesign/calendar</h1>
        <p>React Example</p>
      </div>

      <div className="toolbar">
        <button onClick={prev}>⬅ 上一个</button>
        <button onClick={today}>今天</button>
        <button onClick={next}>下一个 ➡</button>

        <div className="spacer"></div>

        <button
          onClick={() => changeView('month')}
          className={currentView === 'month' ? 'active' : ''}
        >
          月视图
        </button>
        <button
          onClick={() => changeView('week')}
          className={currentView === 'week' ? 'active' : ''}
        >
          周视图
        </button>
        <button
          onClick={() => changeView('day')}
          className={currentView === 'day' ? 'active' : ''}
        >
          日视图
        </button>

        <button onClick={showAddModal} className="primary">
          ➕ 添加事件
        </button>
      </div>

      <div className="stats">
        <div className="stat-item">
          <div className="stat-value">{events.length}</div>
          <div className="stat-label">总事件</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{upcomingCount}</div>
          <div className="stat-label">即将到来</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{pastCount}</div>
          <div className="stat-label">已过期</div>
        </div>
      </div>

      <div className="calendar-container">
        {/* 这里可以使用 Calendar 组件替代 Hook */}
        <div style={{ minHeight: '600px' }}>
          <p>当前视图: {currentView}</p>
          <p>当前日期: {currentDate.toLocaleDateString()}</p>
          <p>事件数: {events.length}</p>
        </div>
      </div>

      {/* 添加事件模态框 */}
      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">添加事件</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>开始时间</label>
                <input
                  type="datetime-local"
                  value={formData.start}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>结束时间</label>
                <input
                  type="datetime-local"
                  value={formData.end}
                  onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button type="submit" className="primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

