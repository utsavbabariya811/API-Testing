import React, { useState } from 'react';
import { 
  FolderGit2, 
  Layers, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  Sparkles,
  GitBranch,
  ShieldCheck
} from 'lucide-react';

export default function Projects() {
  const [filter, setFilter] = useState('all');

  const projects = [
    {
      id: 'proj-1',
      title: 'Full-Stack Performance Engine',
      category: 'Infrastructure',
      description: 'Route-based code splitting, dynamic Chart.js chunking, and lazy loading pipeline for sub-second page loads.',
      progress: 92,
      status: 'active',
      tasksCount: 14,
      completedTasks: 12,
      deadline: 'Oct 15, 2026',
      lead: 'Anmol Dholiya',
      badgeColor: '#4f46e5'
    },
    {
      id: 'proj-2',
      title: 'JWT Auth & Security Middleware',
      category: 'Security',
      description: 'Centralized token verification pipeline, bcrypt hashing, and role-based endpoint authorization.',
      progress: 100,
      status: 'completed',
      tasksCount: 18,
      completedTasks: 18,
      deadline: 'Sep 28, 2026',
      lead: 'Dev Team',
      badgeColor: '#10b981'
    },
    {
      id: 'proj-3',
      title: 'MongoDB RESTful Task Service',
      category: 'Backend',
      description: 'High-throughput Mongoose ODM schema with pagination, regex search, and HATEOAS hypermedia links.',
      progress: 85,
      status: 'active',
      tasksCount: 22,
      completedTasks: 19,
      deadline: 'Nov 05, 2026',
      lead: 'Backend Core',
      badgeColor: '#0ea5e9'
    },
    {
      id: 'proj-4',
      title: 'Responsive Glassmorphism UI Suite',
      category: 'Frontend',
      description: 'Accessible theme tokens, Kanban drag-drop boards, toast notifications, and optimistic UI updates.',
      progress: 78,
      status: 'active',
      tasksCount: 16,
      completedTasks: 12,
      deadline: 'Dec 01, 2026',
      lead: 'UI/UX Guild',
      badgeColor: '#f59e0b'
    }
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.status === filter);

  return (
    <div className="projects-page-container" style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{ padding: '0.35rem', background: '#e0e7ff', borderRadius: '8px', color: '#4f46e5' }}>
              <FolderGit2 size={24} />
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Project Initiatives
            </h1>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem' }}>
            Multi-route code-split component loaded on demand via <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#4f46e5' }}>React.lazy()</code>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            All Projects ({projects.length})
          </button>
          <button 
            className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('active')}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            Active ({projects.filter(p => p.status === 'active').length})
          </button>
          <button 
            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('completed')}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            Completed ({projects.filter(p => p.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#eef2ff', padding: '0.8rem', borderRadius: '10px', color: '#4f46e5' }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '600' }}>Active Sprints</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>3 Sprints</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#ecfdf5', padding: '0.8rem', borderRadius: '10px', color: '#10b981' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '600' }}>Tasks Delivered</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>61 Tasks</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#fef3c7', padding: '0.8rem', borderRadius: '10px', color: '#d97706' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '600' }}>Avg Velocity</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>88.7%</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#f0fdf4', padding: '0.8rem', borderRadius: '10px', color: '#059669' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '600' }}>Code Health</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>99.4%</div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filteredProjects.map((p) => (
          <div 
            key={p.id}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span 
                  style={{ 
                    padding: '0.25rem 0.65rem', 
                    borderRadius: '999px', 
                    fontSize: '0.74rem', 
                    fontWeight: '600', 
                    background: `${p.badgeColor}15`, 
                    color: p.badgeColor 
                  }}
                >
                  {p.category}
                </span>
                <span 
                  style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '600', 
                    color: p.status === 'completed' ? '#10b981' : '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.status === 'completed' ? '#10b981' : '#f59e0b' }} />
                  {p.status === 'completed' ? 'Completed' : 'In Progress'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.5rem' }}>
                {p.title}
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                {p.description}
              </p>
            </div>

            <div>
              {/* Progress Bar */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem' }}>
                  <span>Completion</span>
                  <span>{p.progress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${p.progress}%`, 
                      height: '100%', 
                      background: p.status === 'completed' ? '#10b981' : 'linear-gradient(90deg, #4f46e5, #0ea5e9)',
                      borderRadius: '999px' 
                    }} 
                  />
                </div>
              </div>

              {/* Card Footer Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users size={14} />
                  <span>{p.lead}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} />
                  <span>{p.deadline}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
