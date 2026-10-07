import React, { memo, useMemo } from 'react';
import { CheckCircle2, Clock, ListTodo, Flame } from 'lucide-react';

function StatsBar({ tasks = [], activeFilter = '', onFilterClick, onSelectFilter }) {
  const handler = onFilterClick || onSelectFilter;

  const { total, pending, inProgress, completed, highPriority } = useMemo(() => {
    let p = 0, ip = 0, c = 0, hp = 0;
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      const s = t.status || (t.completed ? 'completed' : 'pending');
      if (s === 'pending') p++;
      else if (s === 'in-progress') ip++;
      else if (s === 'completed') c++;

      if (t.priority === 'high' && s !== 'completed') hp++;
    }
    return { total: tasks.length, pending: p, inProgress: ip, completed: c, highPriority: hp };
  }, [tasks]);

  return (
    <div className="stats-grid">
      <div
        className={`stat-card ${activeFilter === '' ? 'active-filter' : ''}`}
        onClick={() => handler && handler('status', '')}
        title="View All Tasks"
      >
        <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
          <ListTodo size={22} />
        </div>
        <div>
          <div className="stat-number">{total}</div>
          <div className="stat-label">All Tasks</div>
        </div>
      </div>

      <div
        className={`stat-card ${activeFilter === 'pending' ? 'active-filter' : ''}`}
        onClick={() => handler && handler('status', 'pending')}
        title="Filter by Pending Tasks"
      >
        <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
          <Clock size={22} />
        </div>
        <div>
          <div className="stat-number">{pending}</div>
          <div className="stat-label">To Do (Pending)</div>
        </div>
      </div>

      <div
        className={`stat-card ${activeFilter === 'in-progress' ? 'active-filter' : ''}`}
        onClick={() => handler && handler('status', 'in-progress')}
        title="Filter by In Progress Tasks"
      >
        <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
          <Clock size={22} />
        </div>
        <div>
          <div className="stat-number">{inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
      </div>

      <div
        className={`stat-card ${activeFilter === 'completed' ? 'active-filter' : ''}`}
        onClick={() => handler && handler('status', 'completed')}
        title="Filter by Completed Tasks"
      >
        <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
          <CheckCircle2 size={22} />
        </div>
        <div>
          <div className="stat-number">{completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div
        className={`stat-card ${activeFilter === 'high' ? 'active-filter' : ''}`}
        onClick={() => handler && handler('priority', activeFilter === 'high' ? '' : 'high')}
        title="Filter by High Priority Tasks"
      >
        <div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
          <Flame size={22} />
        </div>
        <div>
          <div className="stat-number">{highPriority}</div>
          <div className="stat-label">Urgent (High)</div>
        </div>
      </div>
    </div>
  );
}

export default memo(StatsBar);

