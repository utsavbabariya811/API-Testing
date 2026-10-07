import { lazy } from 'react';

/**
 * lazyWithDelay
 * Solves Supplementary Problem 2: Adds a minimum-delay fallback to avoid a flickering
 * loading state (Flash of Unstyled/Loading Content) on high-speed network connections.
 * 
 * When chunks load in <50ms on fast networks or local dev, standard Suspense fallbacks
 * flash violently for a few frames before unmounting, causing visual disorientation.
 * This wrapper guarantees that if the loading state appears, it renders for at least
 * `minDelayMs` (default 300ms) to ensure smooth, natural visual transitions.
 * 
 * @param {Function} importFactory - Dynamic import function, e.g. () => import('./pages/Projects')
 * @param {number} minDelayMs - Minimum duration in milliseconds to maintain fallback
 * @returns {React.LazyExoticComponent}
 */
export function lazyWithDelay(importFactory, minDelayMs = 300) {
  return lazy(() => {
    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, minDelayMs));
    return Promise.all([importFactory(), minDelayPromise]).then(([moduleExports]) => moduleExports);
  });
}

export default lazyWithDelay;
