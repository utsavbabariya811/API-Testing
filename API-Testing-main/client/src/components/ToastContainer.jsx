import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const type = toast.type || 'info';
        return (
          <div key={toast.id} className={`toast toast-${type}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {type === 'success' && <CheckCircle2 size={18} color="#059669" />}
              {type === 'error' && <AlertCircle size={18} color="#dc2626" />}
              {type === 'warning' && <AlertTriangle size={18} color="#d97706" />}
              {type === 'info' && <Info size={18} color="#0284c7" />}
              <div>
                {toast.title && <strong style={{ display: 'block', fontSize: '0.86rem', color: '#0f172a' }}>{toast.title}</strong>}
                <span style={{ fontSize: '0.84rem', color: '#334155' }}>{toast.message}</span>
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
