import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import StatsBar from './components/StatsBar';
import TaskCard from './components/TaskCard';
import ToastContainer from './components/ToastContainer';
import { 
  getTasks, 
  prefetchTasks,
  createTask, 
  updateTask, 
  patchTask, 
  deleteTask, 
  checkBackendHealth,
  registerUser,
  loginUser,
  getMe,
  logout,
  getToken,
  getStoredUser,
  BASE_URL
} from './services/api';
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  Inbox, 
  AlertCircle, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  ServerCrash,
  X,
  PlusCircle,
  Clock,
  Play,
  CheckCircle2,
  Lock,
  LogIn,
  KeyRound,
  Zap
} from 'lucide-react';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PageSkeletonFallback from './components/PageSkeletonFallback';
import { lazyWithDelay } from './utils/lazyWithDelay';

// ── Dynamic / Lazy Loaded Components (Code-Splitting) ─────────────────────────
const TaskForm = lazy(() => import('./components/TaskForm'));
const TaskModal = lazy(() => import('./components/TaskModal'));
const ConfirmDialog = lazy(() => import('./components/ConfirmDialog'));
const HateoasModal = lazy(() => import('./components/HateoasModal'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const PerformanceShowcase = lazy(() => import('./components/PerformanceShowcase'));

// ── Lazy-Loaded Route Components (Practical 8 Route-Based Code Splitting) ─────
const Projects = lazyWithDelay(() => import('./pages/Projects'), 300);
const Analytics = lazyWithDelay(() => import('./pages/Analytics'), 300);
const Contact = lazyWithDelay(() => import('./pages/Contact'), 300);

// ── Chunk Preloading Helpers (Hover & Idle Prefetching) ────────────────────────
export const preloadAuthModal = () => import('./components/AuthModal');
export const preloadTaskModal = () => import('./components/TaskModal');
export const preloadConfirmDialog = () => import('./components/ConfirmDialog');
export const preloadHateoasModal = () => import('./components/HateoasModal');
export const preloadTaskForm = () => import('./components/TaskForm');
export const preloadPerformanceShowcase = () => import('./components/PerformanceShowcase');
export const preloadProjects = () => import('./pages/Projects');
export const preloadAnalytics = () => import('./pages/Analytics');
export const preloadContact = () => import('./pages/Contact');


function ModalLoadingFallback() {
  return (
    <div className="modal-overlay" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center', padding: '2.5rem 2rem' }}>
        <RefreshCw size={28} className="spinner" style={{ color: 'var(--primary)', margin: '0 auto 0.8rem' }} />
        <h4 style={{ margin: '0 0 0.3rem', fontSize: '1rem', color: 'var(--text-main)' }}>Loading Module...</h4>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dynamically fetching chunk bundle</p>
      </div>
    </div>
  );
}

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Main Data States
  const [tasks, setTasks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Layout & View States
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskInitialStatus, setNewTaskInitialStatus] = useState('pending');
  const [showPerformanceHub, setShowPerformanceHub] = useState(false);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Loading & Connection States
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);

  // Modal States
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [inspectingTask, setInspectingTask] = useState(null);

  // Toast Notification System
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message, title = '') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Idle Preload: Warm up modal bundles strictly after initial render and main thread settlement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1000));
        idleCallback(() => {
          preloadAuthModal();
          preloadTaskModal();
          preloadConfirmDialog();
          preloadHateoasModal();
          preloadTaskForm();
          preloadProjects();
          preloadAnalytics();
          preloadContact();
        });
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);



  // ── Fetch Tasks from MongoDB Backend ──────────────────────────────────────
  const fetchTasksList = useCallback(async (currentPage = page, search = searchQuery, status = statusFilter, priority = priorityFilter) => {
    const token = getToken();
    if (!token) {
      setTasks([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await getTasks({
        page: currentPage,
        limit: viewMode === 'board' ? 50 : 10,
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined
      });

      if (response && response.success) {
        setTasks(response.data || []);
        setTotalCount(response.total || response.count || 0);
        setPage(response.page || 1);
        setTotalPages(response.totalPages || 1);
        setBackendConnected(true);

        // Preload next page of tasks in the background for instant pagination
        if (response.page < response.totalPages) {
          prefetchTasks({
            page: response.page + 1,
            limit: viewMode === 'board' ? 50 : 10,
            search: search || undefined,
            status: status || undefined,
            priority: priority || undefined
          });
        }
      }
    } catch (err) {
      console.error('Fetch tasks error:', err);
      if (err.status === 401 || err.isAuthError) {
        logout();
        setCurrentUser(null);
        addToast('error', 'Session expired or unauthenticated. Please sign in.', 'Authentication Required');
      } else {
        addToast('error', err.message, 'Failed to fetch tasks');
      }
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, priorityFilter, viewMode]);

  // Debounced Search Effect (300ms) to prevent unnecessary network requests
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasksList(1, searchQuery, statusFilter, priorityFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);


  // Initial mount: Verify stored session and fetch tasks
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const res = await getMe();
          if (res && res.user) {
            setCurrentUser(res.user);
            fetchTasksList();
          }
        } catch {
          logout();
          setCurrentUser(null);
        }
      }
    };
    initAuth();
  }, [fetchTasksList]);

  // Health ping interval
  useEffect(() => {
    const checkStatus = async () => {
      const health = await checkBackendHealth();
      setBackendConnected(health.ok);
    };
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // ── Authentication Handlers ────────────────────────────────────────────────
  const handleAuthSuccess = async (actionType, payload) => {
    try {
      const res = actionType === 'login' 
        ? await loginUser(payload)
        : await registerUser(payload);

      if (res && res.user) {
        setCurrentUser(res.user);
        addToast('success', `Welcome, ${res.user.name || res.user.email}!`, 'Signed In (JWT Active)');
        fetchTasksList(1);
      }
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setTasks([]);
    setTotalCount(0);
    addToast('info', 'You have been signed out. Tokens cleared.', 'Signed Out');
  };

  // ── Handle Task Creation (POST /tasks) with Optimistic UI Update ──────────
  const handleCreateTask = async (taskPayload) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      addToast('warning', 'Please sign in to create tasks with JWT authentication.', 'Authentication Required');
      return;
    }

    setCreateLoading(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      _id: tempId,
      ...taskPayload,
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };

    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const res = await createTask(taskPayload);
      if (res && res.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === tempId ? res.data : t))
        );
        addToast('success', `"${res.data.title}" saved to MongoDB`, 'Task Created');
        setIsNewTaskModalOpen(false);
        fetchTasksList(page);
      }
    } catch (err) {
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      if (err.status === 401) {
        setIsAuthModalOpen(true);
      }
      addToast('error', err.message, 'Create Task Failed');
      throw err;
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Handle Status Toggle / Progression (PATCH /tasks/:id) ─────────────────
  const handleToggleStatus = async (task, targetStatus = null) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const taskId = task._id || task.id;
    const currentStatus = task.status || (task.completed ? 'completed' : 'pending');

    let nextStatus = targetStatus;
    if (!nextStatus) {
      nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    }

    const previousTasks = [...tasks];

    setTasks((prev) =>
      prev.map((t) =>
        (t._id || t.id) === taskId
          ? { ...t, status: nextStatus, completed: nextStatus === 'completed' }
          : t
      )
    );

    try {
      const res = await patchTask(taskId, {
        status: nextStatus,
        completed: nextStatus === 'completed'
      });

      if (res && res.success) {
        setTasks((prev) =>
          prev.map((t) => ((t._id || t.id) === taskId ? res.data : t))
        );
        addToast('success', `Task moved to ${nextStatus}`, 'Updated');
      }
    } catch (err) {
      setTasks(previousTasks);
      addToast('error', `Failed to update status: ${err.message}`, 'Update Error');
    }
  };

  // ── Handle Task Update (PUT /tasks/:id) ───────────────────────────────────
  const handleUpdateTask = async (id, updatedPayload) => {
    setModalLoading(true);
    try {
      const res = await updateTask(id, updatedPayload);
      if (res && res.success) {
        setTasks((prev) =>
          prev.map((t) => ((t._id || t.id) === id ? res.data : t))
        );
        addToast('success', 'Task updated successfully', 'Success');
        setEditingTask(null);
      }
    } catch (err) {
      addToast('error', err.message, 'Update Failed');
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  // ── Handle Task Deletion (DELETE /tasks/:id) with Dialog Confirmation ──────
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    const taskId = deletingTask._id || deletingTask.id;
    setDeleteLoading(true);

    try {
      const res = await deleteTask(taskId);
      if (res && res.success) {
        setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
        addToast('success', `Task "${deletingTask.title}" removed`, 'Deleted');
        setDeletingTask(null);
        fetchTasksList(page);
      }
    } catch (err) {
      addToast('error', err.message, 'Delete Failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter tasks for Board columns
  const pendingTasks = tasks.filter(t => (t.status === 'pending' || (!t.status && !t.completed)));
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => (t.status === 'completed' || t.completed));

  const handleOpenCreateModal = (status = 'pending') => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      addToast('warning', 'Please sign in to create tasks.', 'Authentication Required');
      return;
    }
    setNewTaskInitialStatus(status);
    setIsNewTaskModalOpen(true);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Top Navbar with Route Links and Hover Preloading */}
        <Navbar
          backendConnected={backendConnected}
          onRefresh={() => fetchTasksList(page)}
          onOpenNewTask={() => handleOpenCreateModal('pending')}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onPreloadAuth={preloadAuthModal}
          onPreloadNewTask={() => {
            preloadTaskForm();
            preloadTaskModal();
          }}
          onPreloadProjects={preloadProjects}
          onPreloadAnalytics={preloadAnalytics}
          onPreloadContact={preloadContact}
          currentUser={currentUser}
          onLogout={handleLogout}
          loading={loading}
        />

      {/* Backend Offline Warning Banner */}
      {!backendConnected && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          boxShadow: 'var(--shadow-card)'
        }}>
          <ServerCrash size={28} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#991b1b', marginBottom: '0.3rem' }}>
              Backend Connection Offline (Cannot Reach {BASE_URL})
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#b91c1c', marginBottom: '0.75rem' }}>
              Please ensure your Express server is running on <code style={{ background: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fecaca' }}>http://localhost:5000</code> and MongoDB is running.
            </p>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
              onClick={() => fetchTasksList(page)}
            >
              <RefreshCw size={13} />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Route-Based Suspense Container (Practical 8) ──────────────────── */}
      <Suspense fallback={<PageSkeletonFallback />}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Unauthenticated Banner */}
                {!currentUser && (
        <div style={{
          background: 'linear-gradient(135deg, #eef2ff, #f8fafc)',
          border: '1.5px solid #c7d2fe',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'var(--accent-primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
            }}>
              <KeyRound size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                Practical 7: JWT Authentication & Performance Pipeline Active
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Equipped with Dynamic Loading, SWR In-Memory Caching, Prefetching & Express MongoDB Indexing.
              </p>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setIsAuthModalOpen(true)}
            onMouseEnter={preloadAuthModal}
            onFocus={preloadAuthModal}
            style={{ padding: '0.6rem 1.25rem' }}
          >
            <LogIn size={16} />
            <span>Sign In / Register</span>
          </button>
        </div>
      )}

      {/* Stats Summary Bar */}
      <StatsBar
        tasks={tasks}
        totalCount={totalCount}
        activeFilter={statusFilter || priorityFilter}
        onFilterClick={(type, filterKey) => {
          if (type === 'priority') {
            setPriorityFilter(filterKey);
            fetchTasksList(1, searchQuery, statusFilter, filterKey);
          } else {
            setStatusFilter(filterKey);
            fetchTasksList(1, searchQuery, filterKey, priorityFilter);
          }
        }}
      />

      {/* Unified Control Hub Bar */}
      <div className="control-hub">
        <div className="control-left">
          <div className="search-box" style={{ width: '100%' }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks across MongoDB (Debounced 300ms)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchTasksList(1, searchQuery, statusFilter, priorityFilter);
                }
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  fetchTasksList(1, '', statusFilter, priorityFilter);
                }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="control-right">
          {/* Priority Select */}
          <select
            className="form-select"
            style={{ width: '145px', padding: '0.55rem 0.8rem', fontSize: '0.84rem' }}
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              fetchTasksList(1, searchQuery, statusFilter, e.target.value);
            }}
          >
            <option value="">All Priorities</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          {/* View Mode Switcher */}
          <div className="view-switcher">
            <button
              className={`view-btn ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
              title="Kanban Board View"
            >
              <LayoutGrid size={15} />
              <span>Board</span>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List Stream View"
            >
              <List size={15} />
              <span>List</span>
            </button>
          </div>

          {/* Performance & Media Showcase Toggle */}
          <button
            className={`btn ${showPerformanceHub ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.82rem' }}
            onClick={() => setShowPerformanceHub((prev) => !prev)}
            onMouseEnter={preloadPerformanceShowcase}
            onFocus={preloadPerformanceShowcase}
            title="Toggle Code Splitting, Lazy Media, and Preloading Showcase"
          >
            <Zap size={15} />
            <span>{showPerformanceHub ? 'Hide Perf Hub' : '⚡ Perf & Media Hub'}</span>
          </button>

          {/* Quick Create Button */}
          <button
            className="btn btn-primary"
            style={{ padding: '0.55rem 1rem' }}
            onClick={() => handleOpenCreateModal('pending')}
            onMouseEnter={() => {
              preloadTaskForm();
              preloadTaskModal();
            }}
            onFocus={() => {
              preloadTaskForm();
              preloadTaskModal();
            }}
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>

        </div>
      </div>

      {/* ── KANBAN BOARD VIEW ────────────────────────────────────────────── */}
      {viewMode === 'board' ? (
        <div className="kanban-board">
          {/* Column 1: Pending / To Do */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <div className="column-title">
                <span className="column-dot" style={{ background: '#d97706' }} />
                <span>To Do / Pending</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="column-count">{pendingTasks.length}</span>
                <button
                  className="btn-icon"
                  onClick={() => handleOpenCreateModal('pending')}
                  onMouseEnter={preloadTaskForm}
                  title="Add pending task"
                  style={{ padding: '0.2rem 0.4rem' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="column-card-list">
              {pendingTasks.length === 0 ? (
                <div className="column-empty">
                  <Clock size={24} style={{ color: '#d97706', marginBottom: '0.4rem' }} />
                  <p>{currentUser ? 'No pending tasks' : 'Sign in to view tasks'}</p>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', marginTop: '0.6rem' }}
                    onClick={() => handleOpenCreateModal('pending')}
                    onMouseEnter={preloadTaskForm}
                  >
                    + Create Task
                  </button>
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <TaskCard
                    key={task._id || task.id}
                    task={task}
                    isOptimistic={task.isOptimistic}
                    onToggleStatus={handleToggleStatus}
                    onEdit={(t) => {
                      preloadTaskModal();
                      setEditingTask(t);
                    }}
                    onDelete={(t) => {
                      preloadConfirmDialog();
                      setDeletingTask(t);
                    }}
                    onViewHateoas={(t) => {
                      preloadHateoasModal();
                      setInspectingTask(t);
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <div className="column-title">
                <span className="column-dot" style={{ background: '#4f46e5' }} />
                <span>In Progress</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="column-count">{inProgressTasks.length}</span>
                <button
                  className="btn-icon"
                  onClick={() => handleOpenCreateModal('in-progress')}
                  onMouseEnter={preloadTaskForm}
                  title="Add in-progress task"
                  style={{ padding: '0.2rem 0.4rem' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="column-card-list">
              {inProgressTasks.length === 0 ? (
                <div className="column-empty">
                  <Play size={24} style={{ color: '#4f46e5', marginBottom: '0.4rem' }} />
                  <p>{currentUser ? 'No tasks in progress' : 'Sign in to view tasks'}</p>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', marginTop: '0.6rem' }}
                    onClick={() => handleOpenCreateModal('in-progress')}
                    onMouseEnter={preloadTaskForm}
                  >
                    + Start Task
                  </button>
                </div>
              ) : (
                inProgressTasks.map((task) => (
                  <TaskCard
                    key={task._id || task.id}
                    task={task}
                    isOptimistic={task.isOptimistic}
                    onToggleStatus={handleToggleStatus}
                    onEdit={(t) => {
                      preloadTaskModal();
                      setEditingTask(t);
                    }}
                    onDelete={(t) => {
                      preloadConfirmDialog();
                      setDeletingTask(t);
                    }}
                    onViewHateoas={(t) => {
                      preloadHateoasModal();
                      setInspectingTask(t);
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <div className="column-title">
                <span className="column-dot" style={{ background: '#059669' }} />
                <span>Completed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="column-count">{completedTasks.length}</span>
                <button
                  className="btn-icon"
                  onClick={() => handleOpenCreateModal('completed')}
                  onMouseEnter={preloadTaskForm}
                  title="Add completed task"
                  style={{ padding: '0.2rem 0.4rem' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="column-card-list">
              {completedTasks.length === 0 ? (
                <div className="column-empty">
                  <CheckCircle2 size={24} style={{ color: '#059669', marginBottom: '0.4rem' }} />
                  <p>{currentUser ? 'No completed tasks yet' : 'Sign in to view tasks'}</p>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', marginTop: '0.6rem' }}
                    onClick={() => handleOpenCreateModal('completed')}
                    onMouseEnter={preloadTaskForm}
                  >
                    + Add Task
                  </button>
                </div>
              ) : (
                completedTasks.map((task) => (
                  <TaskCard
                    key={task._id || task.id}
                    task={task}
                    isOptimistic={task.isOptimistic}
                    onToggleStatus={handleToggleStatus}
                    onEdit={(t) => {
                      preloadTaskModal();
                      setEditingTask(t);
                    }}
                    onDelete={(t) => {
                      preloadConfirmDialog();
                      setDeletingTask(t);
                    }}
                    onViewHateoas={(t) => {
                      preloadHateoasModal();
                      setInspectingTask(t);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── LIST STREAM VIEW ──────────────────────────────────────────────── */
        <div className="task-list-view">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <Inbox size={48} color="var(--primary)" style={{ opacity: 0.7, marginBottom: '0.75rem' }} />
              <h3>{currentUser ? 'No tasks found' : 'Sign in to access tasks'}</h3>
              <p>
                {currentUser
                  ? 'Try clearing your active filters or create a new task above.'
                  : 'All endpoints are secured by JWT Bearer token authentication.'}
              </p>
              {currentUser ? (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '1rem' }}
                  onClick={() => handleOpenCreateModal('pending')}
                  onMouseEnter={preloadTaskForm}
                >
                  <Plus size={16} />
                  <span>Create First Task</span>
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '1rem' }}
                  onClick={() => setIsAuthModalOpen(true)}
                  onMouseEnter={preloadAuthModal}
                >
                  <LogIn size={16} />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tasks.map((task) => (
                <TaskCard
                  key={task._id || task.id}
                  task={task}
                  isOptimistic={task.isOptimistic}
                  onToggleStatus={handleToggleStatus}
                  onEdit={(t) => {
                    preloadTaskModal();
                    setEditingTask(t);
                  }}
                  onDelete={(t) => {
                    preloadConfirmDialog();
                    setDeletingTask(t);
                  }}
                  onViewHateoas={(t) => {
                    preloadHateoasModal();
                    setInspectingTask(t);
                  }}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls with Data Prefetch on Hover */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                disabled={page <= 1 || loading}
                onMouseEnter={() => {
                  if (page > 1) {
                    prefetchTasks({
                      page: page - 1,
                      limit: 10,
                      search: searchQuery,
                      status: statusFilter,
                      priority: priorityFilter
                    });
                  }
                }}
                onClick={() => {
                  const prevPage = page - 1;
                  setPage(prevPage);
                  fetchTasksList(prevPage);
                }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Page {page} of {totalPages}
              </span>

              <button
                className="btn btn-secondary"
                disabled={page >= totalPages || loading}
                onMouseEnter={() => {
                  if (page < totalPages) {
                    prefetchTasks({
                      page: page + 1,
                      limit: 10,
                      search: searchQuery,
                      status: statusFilter,
                      priority: priorityFilter
                    });
                  }
                }}
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchTasksList(nextPage);
                }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

                {/* ── PERFORMANCE, CODE-SPLITTING & LAZY MEDIA SHOWCASE ────────────── */}
                <Suspense fallback={<div className="skeleton" style={{ height: '320px', borderRadius: '12px', marginTop: '2rem' }} />}>
                  {showPerformanceHub && <PerformanceShowcase />}
                </Suspense>
              </>
            }
          />
          <Route path="/projects" element={<Projects />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* ── SUSPENSE WRAPPED DYNAMIC MODALS (Lazy Loaded on Demand) ── */}
      <Suspense fallback={<ModalLoadingFallback />}>

        {/* Create Task Modal (POST /tasks) */}
        {isNewTaskModalOpen && (
          <div className="modal-overlay" onClick={() => setIsNewTaskModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <PlusCircle size={22} color="#4f46e5" />
                  <h3 className="modal-title">Create New Task (POST /tasks)</h3>
                </div>
                <button className="btn-icon" onClick={() => setIsNewTaskModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <TaskForm
                onSubmit={handleCreateTask}
                loading={createLoading}
                initialStatus={newTaskInitialStatus}
              />
            </div>
          </div>
        )}

        {/* Authentication Modal (JWT Sign In / Register) */}
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        )}

        {/* Edit Task Modal (PUT) */}
        {editingTask && (
          <TaskModal
            task={editingTask}
            isOpen={Boolean(editingTask)}
            onClose={() => setEditingTask(null)}
            onSave={handleUpdateTask}
            loading={modalLoading}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingTask && (
          <ConfirmDialog
            isOpen={Boolean(deletingTask)}
            taskTitle={deletingTask?.title}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeletingTask(null)}
            loading={deleteLoading}
          />
        )}

        {/* HATEOAS & JSON Inspector Modal */}
        {inspectingTask && (
          <HateoasModal
            task={inspectingTask}
            isOpen={Boolean(inspectingTask)}
            onClose={() => setInspectingTask(null)}
          />
        )}
      </Suspense>

      {/* Toast Feedback Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  </BrowserRouter>
  );
}

