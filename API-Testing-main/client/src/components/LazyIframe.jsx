import React, { useState, useRef, useEffect } from 'react';
import { Globe, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';

/**
 * Lazy Iframe Component
 * Demonstrates:
 * - loading="lazy" attribute for iframes
 * - IntersectionObserver viewport activation
 * - Sandboxed execution and loading skeleton
 */
export default function LazyIframe({
  src,
  title = 'Embedded Live API Explorer',
  height = '360px',
  badge = 'loading="lazy"'
}) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '120px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="lazy-media-container"
      style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        background: '#ffffff',
        height
      }}
    >
      {/* Skeleton while iframe is loading or out of view */}
      {(!isInView || !isLoaded) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '0.6rem',
            background: '#f8fafc',
            color: 'var(--text-muted)'
          }}
        >
          {isInView ? (
            <>
              <RefreshCw size={26} className="spinner" style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: '500' }}>Initializing iframe sandbox...</span>
            </>
          ) : (
            <>
              <Globe size={28} style={{ opacity: 0.6 }} />
              <span style={{ fontSize: '0.82rem', fontWeight: '500' }}>Iframe deferred until visible</span>
            </>
          )}
        </div>
      )}

      {/* Actual Iframe with loading="lazy" */}
      {isInView && (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          sandbox="allow-scripts allow-same-origin"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.35s ease'
          }}
        />
      )}

      {/* Performance Badge */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.25rem 0.6rem',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(6px)',
          color: '#ffffff',
          borderRadius: '6px',
          fontSize: '0.72rem',
          fontWeight: '600',
          zIndex: 10
        }}
      >
        {isLoaded ? <CheckCircle size={12} color="#10b981" /> : <Globe size={12} color="#60a5fa" />}
        <span>{isLoaded ? 'Iframe Mounted' : badge}</span>
      </div>
    </div>
  );
}
