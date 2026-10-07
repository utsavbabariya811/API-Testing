import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Eye, Check } from 'lucide-react';

/**
 * High-Performance Lazy Loaded Image Component
 * Uses native loading="lazy", decoding="async", IntersectionObserver, and shimmer placeholder
 */
export default function LazyImage({ 
  src, 
  alt = '', 
  width, 
  height, 
  aspectRatio = '16/9',
  caption = '',
  badge = 'Lazy Loaded'
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;

    // Use IntersectionObserver for viewport tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={imgRef}
      className="lazy-media-container"
      style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        borderRadius: '12px',
        aspectRatio,
        background: '#f1f5f9',
        border: '1px solid var(--border-subtle)'
      }}
    >
      {/* Shimmer skeleton while loading */}
      {!isLoaded && (
        <div 
          className="skeleton-shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '0.4rem',
            color: 'var(--text-muted)'
          }}
        >
          <ImageIcon size={24} style={{ opacity: 0.5 }} />
          <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>
            {isInView ? 'Loading asset...' : 'Awaiting viewport entry'}
          </span>
        </div>
      )}

      {/* Actual Lazy Image with decoding="async" and loading="lazy" */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.4s ease-in-out',
            display: 'block'
          }}
        />
      )}

      {/* Performance Badge */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.55rem',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        color: '#ffffff',
        borderRadius: '6px',
        fontSize: '0.7rem',
        fontWeight: '600'
      }}>
        {isLoaded ? <Check size={11} color="#10b981" /> : <Eye size={11} />}
        <span>{isLoaded ? 'Loaded in DOM' : badge}</span>
      </div>

      {caption && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0.5rem 0.75rem',
          background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
          color: '#ffffff',
          fontSize: '0.78rem'
        }}>
          {caption}
        </div>
      )}
    </div>
  );
}
