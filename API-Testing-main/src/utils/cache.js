const NodeCache = require('node-cache');

/**
 * Shared In-Memory Cache Instance for Practical 9
 * - stdTTL: 60 seconds default Time-To-Live
 * - checkperiod: 120 seconds for automatic expired key cleanup
 */
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120
});

// Cache Metrics
let cacheHits = 0;
let cacheMisses = 0;

// Standardized Cache Key Constants
const ALL_TASKS_CACHE_KEY = 'all_tasks';
const TASK_CACHE_PREFIX = 'task_';

// Metric accessors
const getCacheHits = () => cacheHits;
const getCacheMisses = () => cacheMisses;
const incrementHit = () => {
  cacheHits++;
};
const incrementMiss = () => {
  cacheMisses++;
};
const resetMetrics = () => {
  cacheHits = 0;
  cacheMisses = 0;
};

// Bind metrics and constants to shared cache object
cache.getCacheHits = getCacheHits;
cache.getCacheMisses = getCacheMisses;
cache.incrementHit = incrementHit;
cache.incrementMiss = incrementMiss;
cache.resetMetrics = resetMetrics;
cache.ALL_TASKS_CACHE_KEY = ALL_TASKS_CACHE_KEY;
cache.TASK_CACHE_PREFIX = TASK_CACHE_PREFIX;

module.exports = cache;
