import React, { useState } from 'react';
import { LogIn, UserPlus, AlertCircle, Lock, Mail, User, X, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (tab === 'register' && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        await onAuthSuccess('login', { email: email.trim(), password });
      } else {
        await onAuthSuccess('register', { name: name.trim(), email: email.trim(), password });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--accent-primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              {tab === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>
                {tab === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Practical 7 • JWT Authentication & Protected Middleware
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          padding: '0.25rem',
          borderRadius: '8px',
          marginBottom: '1.25rem'
        }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: tab === 'login' ? '#ffffff' : 'transparent',
              color: tab === 'login' ? 'var(--accent-primary)' : 'var(--text-muted)',
              boxShadow: tab === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s'
            }}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Sign In (POST /login)
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: tab === 'register' ? '#ffffff' : 'transparent',
              color: tab === 'register' ? 'var(--accent-primary)' : 'var(--text-muted)',
              boxShadow: tab === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s'
            }}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Register (POST /register)
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem 0.95rem',
            borderRadius: '8px',
            fontSize: '0.84rem',
            fontWeight: '500',
            marginBottom: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="authName">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="authName"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="authEmail">
              Email Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="authEmail"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="authPassword">
              Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="authPassword"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                placeholder={tab === 'register' ? 'Min. 6 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem 1rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Processing...</span>
              </>
            ) : tab === 'login' ? (
              <>
                <LogIn size={16} />
                <span>Sign In & Generate JWT</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Account (bcrypt + JWT)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
