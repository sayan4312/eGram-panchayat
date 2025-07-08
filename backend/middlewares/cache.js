const cache = new Map();

const cacheMiddleware = (duration = 300000) => { // Default 5 minutes
  return (req, res, next) => {
    const key = `${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);
    
    if (cachedResponse && (Date.now() - cachedResponse.timestamp) < duration) {
      return res.json(cachedResponse.data);
    }
    
    // Store original send method
    const originalSend = res.json;
    
    // Override send method to cache response
    res.json = function(data) {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
      
      // Call original send method
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Clear cache for specific routes
const clearCache = (pattern) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

// Clear all cache
const clearAllCache = () => {
  cache.clear();
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearAllCache
}; 