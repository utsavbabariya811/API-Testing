import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Layers, 
  RefreshCw, 
  AlertCircle, 
  Server, 
  PlusCircle, 
  LogIn, 
  LogOut, 
  ShieldCheck,
  CheckSquare,
  FolderGit2,
  BarChart3,
  Mail
} from 'lucide-react';

function Navbar({
  backendConnected,
  onRefresh,
  onOpenNewTask,
  onOpenAuth,
  onPreloadAuth,
  onPreloadNewTask,
  onPreloadProjects,
  onPreloadAnalytics,
  onPreloadContact,
  currentUser,
  onLogout,
  loading
}) {
  return (
    <header className="navbar">
      <div className="brand-section">
        <div className="brand-icon">
          <Layers size={26} />
        </div>
        <div className="brand-info">
          <h1>Full-Stack Task Manager</h1>
          <p>Practical 8 • Route Code Splitting • Lazy Chunks & Preloading</p>
        </div>
      </div>

      {/* Route Navigation Links (Code-split routes) */}
      <nav className="nav-links">
        <NavLink 
          to="/" 
          end 
          className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
          title="Kanban Board & Task Stream"
        >
          <CheckSquare size={15} />
          <span>Tasks</span>
        </NavLink>

        <NavLink 
          to="/projects" 
          className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
          onMouseEnter={onPreloadProjects}
          onFocus={onPreloadProjects}
          title="Project Initiatives & Sprints (Lazy Loaded)"
        >
          <FolderGit2 size={15} />
          <span>Projects</span>
        </NavLink>

        <NavLink 
          to="/analytics" 
          className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
          onMouseEnter={onPreloadAnalytics}
          onFocus={onPreloadAnalytics}
          title="Productivity & Chart.js Metrics (Heavy Dynamic Chunk)"
        >
          <BarChart3 size={15} />
          <span>Analytics</span>
        </NavLink>

        <NavLink 
          to="/contact" 
          className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
          onMouseEnter={onPreloadContact}
          onFocus={onPreloadContact}
          title="Support & Feedback (Lazy Loaded)"
        >
          <Mail size={15} />
          <span>Contact</span>
        </NavLink>
      </nav>

      <div className="nav-actions">
        {/* Backend Connection Status Badge */}
        <div
          className={`badge ${backendConnected ? 'badge-connected' : 'badge-disconnected'}`}
          title={backendConnected ? 'Connected to http://localhost:5000' : 'Disconnected from backend'}
        >
          <span className="badge-pulse" />
          {backendConnected ? (
            <>
              <Server size={13} />
              <span>Backend Connected</span>
            </>
          ) : (
            <>
              <AlertCircle size={13} />
              <span>Backend Offline</span>
            </>
          )}
        </div>

        {/* Sync Button */}
        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh task list from MongoDB"
        >
          <RefreshCw size={15} className={loading ? 'spinner' : ''} />
          <span>Sync</span>
        </button>

        {/* User Account / Auth Actions */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.75rem',
                background: '#f1f5f9',
                borderRadius: '9999px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'var(--text-main)'
              }}
            >
              <ShieldCheck size={14} color="#059669" />
              <span>{currentUser.name || currentUser.email.split('@')[0]}</span>
            </div>

            <button
              className="btn btn-secondary"
              onClick={onLogout}
              title="Sign Out"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            className="btn btn-secondary"
            onClick={onOpenAuth}
            onMouseEnter={onPreloadAuth}
            onFocus={onPreloadAuth}
            title="Sign in or register for an account (Preloaded)"
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
        )}

        {/* New Task Button */}
        <button
          className="btn btn-primary"
          onClick={onOpenNewTask}
          onMouseEnter={onPreloadNewTask}
          onFocus={onPreloadNewTask}
          title="Create a new task in MongoDB (Preloaded)"
        >
          <PlusCircle size={16} />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
}

export default memo(Navbar);
