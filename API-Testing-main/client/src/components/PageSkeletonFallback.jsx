import React from 'react';

/**
 * PageSkeletonFallback
 * Meaningful structural placeholder displayed while lazy-loaded route chunks are being fetched.
 * Designed with CSS shimmer animation to avoid layout shifts (CLS = 0).
 */
export default function PageSkeletonFallback({ title = 'Loading Module...' }) {
  return (
    <div className="skeleton-page-container" style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div className="skeleton skeleton-title" style={{ width: '260px', height: '32px', marginBottom: '0.6rem', borderRadius: '6px' }} />
          <div className="skeleton skeleton-text" style={{ width: '380px', height: '16px', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="skeleton" style={{ width: '110px', height: '38px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ width: '130px', height: '38px', borderRadius: '8px' }} />
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="skeleton-card"
            style={{
              height: '110px',
              padding: '1.25rem',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
              <div className="skeleton" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
            </div>
            <div className="skeleton" style={{ width: '120px', height: '28px', borderRadius: '6px' }} />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '2rem',
          minHeight: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
          <div className="skeleton" style={{ width: '200px', height: '22px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ width: '90px', height: '20px', borderRadius: '999px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #edf2f7',
                borderRadius: '10px',
                padding: '1.5rem',
                background: '#fafcff'
              }}
            >
              <div className="skeleton" style={{ width: '60%', height: '18px', marginBottom: '0.8rem', borderRadius: '4px' }} />
              <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '0.4rem', borderRadius: '4px' }} />
              <div className="skeleton" style={{ width: '80%', height: '14px', marginBottom: '1.2rem', borderRadius: '4px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: '70px', height: '22px', borderRadius: '999px' }} />
                <div className="skeleton" style={{ width: '85px', height: '14px', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.88rem' }}>
          <span className="spinner-inline" style={{ display: 'inline-block', marginRight: '8px' }}>⚡</span>
          {title}
        </div>
      </div>
    </div>
  );
}
