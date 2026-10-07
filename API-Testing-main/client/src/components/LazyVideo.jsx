import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Video, CheckCircle2, Eye } from 'lucide-react';

/**
 * Lazy Video Component
 * Demonstrates:
 * - preload="none" (no bandwidth consumed until user interacts or enters viewport)
 * - IntersectionObserver viewport activation
 * - Custom play/pause controls with performance badge
 */
export default function LazyVideo({
  src,
  poster,
  title = 'API Architecture Video Tutorial',
  badge = 'Lazy Streamed'
}) {
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);
  const videoRef = useRef(null);

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
      { rootMargin: '100px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setIsLoaded(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className="lazy-media-container"
      style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#0f172a',
        border: '1px solid var(--border-subtle)',
        aspectRatio: '16/9'
      }}
    >
      {/* Video element with preload="none" */}
      {isInView ? (
        <video
          ref={videoRef}
          preload="none"
          poster={poster}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedData={() => setIsLoaded(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '0.5rem',
            color: '#94a3b8'
          }}
        >
          <Video size={32} />
          <span style={{ fontSize: '0.8rem' }}>Video chunk deferred (0 KB downloaded)</span>
        </div>
      )}

      {/* Overlay Play Button */}
      {isInView && (
        <button
          onClick={togglePlay}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: isPlaying ? 'rgba(15, 23, 42, 0.65)' : 'var(--accent-primary)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)'
          }}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '3px' }} />}
        </button>
      )}

      {/* Performance & Status Badge */}
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
          fontWeight: '600'
        }}
      >
        {isLoaded ? <CheckCircle2 size={12} color="#10b981" /> : <Eye size={12} color="#38bdf8" />}
        <span>{isLoaded ? 'Stream Active' : 'preload="none"'}</span>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0.6rem 1rem',
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem'
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>HTML5 Lazy Video</span>
      </div>
    </div>
  );
}
