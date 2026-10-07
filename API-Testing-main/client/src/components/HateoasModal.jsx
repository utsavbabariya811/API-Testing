import React from 'react';
import { X, Code2, ExternalLink } from 'lucide-react';

export default function HateoasModal({ task, isOpen, onClose }) {
  if (!isOpen || !task) return null;

  const links = task._links || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Code2 size={22} color="#4f46e5" />
            <h3 className="modal-title">HATEOAS Hypermedia Inspector</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1rem' }}>
          Real-time hypermedia controls provided by Express REST API for task <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#4f46e5' }}>#{task._id?.slice(-6)}</code>:
        </p>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Available Transition Links (_links):</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {Object.entries(links).map(([rel, linkObj]) => (
              <div
                key={rel}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.65rem 0.95rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    background: linkObj.method === 'GET' ? '#d1fae5' :
                               linkObj.method === 'POST' ? '#e0e7ff' :
                               linkObj.method === 'DELETE' ? '#fee2e2' : '#fef3c7',
                    color: linkObj.method === 'GET' ? '#065f46' :
                           linkObj.method === 'POST' ? '#3730a3' :
                           linkObj.method === 'DELETE' ? '#991b1b' : '#92400e',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: '700',
                    fontSize: '0.74rem'
                  }}>
                    {linkObj.method}
                  </span>
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>rel: "{rel}"</span>
                </div>
                <span style={{ color: '#475569' }}>{linkObj.href}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Full MongoDB Document JSON:</label>
          <pre className="code-block">{JSON.stringify(task, null, 2)}</pre>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
