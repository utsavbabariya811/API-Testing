import React, { memo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Trash2, 
  Edit3, 
  Calendar, 
  Code, 
  ArrowRight,
  Clock
} from 'lucide-react';

function TaskCard({ 
  task, 
  onToggleStatus, 
  onEdit, 
  onDelete, 
  onViewHateoas,
  isOptimistic = false
}) {
  const taskId = task._id || task.id;
  const status = task.status || (task.completed ? 'completed' : 'pending');
  const isCompleted = status === 'completed';
  const links = task._links || {};

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return null;
    }
  };

  const formattedDueDate = formatDate(task.dueDate);

  return (
    <div className={`task-card ${status}-task ${isOptimistic ? 'optimistic' : ''}`}>
      <div className="task-top">
        <div className="task-main-info">
          <div
            className={`custom-checkbox ${isCompleted ? 'checked' : ''}`}
            onClick={() => !isOptimistic && onToggleStatus(task)}
            title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
          >
            {isCompleted && <CheckCircle2 size={14} color="#fff" />}
          </div>

          <div>
            <div className={`task-title ${isCompleted ? 'completed' : ''}`}>
              {task.title}
            </div>
            {task.description && (
              <p className="task-description">{task.description}</p>
            )}
          </div>
        </div>

        <div className="task-actions">
          {/* Status Progression Button */}
          {status === 'pending' && (
            <button
              className="btn"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#4338ca', background: '#e0e7ff', border: '1px solid #c7d2fe' }}
              onClick={() => onToggleStatus(task, 'in-progress')}
              title="Start task (transition to in-progress)"
              disabled={isOptimistic}
            >
              <Play size={12} />
              <span>Start</span>
            </button>
          )}

          {status === 'in-progress' && (
            <button
              className="btn btn-success"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              onClick={() => onToggleStatus(task, 'completed')}
              title="Complete task"
              disabled={isOptimistic}
            >
              <CheckCircle2 size={12} />
              <span>Done</span>
            </button>
          )}

          {/* Edit Button */}
          <button
            className="btn-icon"
            onClick={() => onEdit(task)}
            title="Edit task (PUT)"
            disabled={isOptimistic}
          >
            <Edit3 size={15} />
          </button>

          {/* Hypermedia / HATEOAS View */}
          {links.self && (
            <button
              className="btn-icon"
              onClick={() => onViewHateoas(task)}
              title="Inspect HATEOAS hypermedia links"
              disabled={isOptimistic}
            >
              <Code size={15} />
            </button>
          )}

          {/* Delete Button */}
          <button
            className="btn-icon"
            style={{ color: '#dc2626' }}
            onClick={() => onDelete(task)}
            title="Delete task (DELETE)"
            disabled={isOptimistic}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="task-footer">
        <div className="task-chips">
          {/* Status Chip */}
          <span className={`status-chip ${status}`}>
            {status}
          </span>

          {/* Priority Chip */}
          {task.priority && (
            <span className={`priority-chip ${task.priority}`}>
              <span>•</span>
              <span>{task.priority}</span>
            </span>
          )}

          {/* Due Date Chip */}
          {formattedDueDate && (
            <span className="date-chip">
              <Calendar size={12} />
              <span>{formattedDueDate}</span>
            </span>
          )}
        </div>

        {taskId && (
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            #{taskId.slice(-6)}
          </span>
        )}
      </div>
    </div>
  );
}

// Custom shallow comparison to eliminate unnecessary re-renders when parent state updates
// (Satisfies Supplementary Problem 3: Profiler Re-render Optimization)
export default memo(TaskCard, (prevProps, nextProps) => {
  const prevTask = prevProps.task || {};
  const nextTask = nextProps.task || {};
  
  return (
    (prevTask._id || prevTask.id) === (nextTask._id || nextTask.id) &&
    prevTask.status === nextTask.status &&
    prevTask.title === nextTask.title &&
    prevTask.description === nextTask.description &&
    prevTask.priority === nextTask.priority &&
    prevTask.dueDate === nextTask.dueDate &&
    prevProps.isOptimistic === nextProps.isOptimistic
  );
});


