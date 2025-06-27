// Create a simple API cache utility
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedData = (key) => {
  if (!cache.has(key)) return null;

  const { data, timestamp } = cache.get(key);
  const isExpired = Date.now() - timestamp > CACHE_DURATION;

  if (isExpired) {
    // Clean up expired entries
    cache.delete(key);
    return null;
  }

  return data;
};

export const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const clearCache = () => {
  cache.clear();
};

export const clearCacheKey = (key) => {
  cache.delete(key);
};

// Clear cache for keys matching a pattern
export const clearCachePattern = (pattern) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};
