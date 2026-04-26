/**
 * Simple in-memory rate limiter for server actions and API routes.
 * In a production multi-instance environment (like Vercel), this will be local to the lambda.
 * For true global rate limiting, use Redis (e.g., @upstash/ratelimit).
 */

const trackers = new Map();

// Clean up expired trackers every 5 minutes
if (typeof global !== 'undefined') {
  if (!global.rateLimitCleanupInterval) {
    global.rateLimitCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of trackers.entries()) {
        if (now > record.resetAt) {
          trackers.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }
}

export function rateLimit(identifier, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const key = `ratelimit_${identifier}`;
  
  let record = trackers.get(key);
  
  if (!record || now > record.resetAt) {
    record = {
      count: 0,
      resetAt: now + windowMs
    };
  }
  
  record.count++;
  trackers.set(key, record);
  
  const remaining = Math.max(0, limit - record.count);
  const success = record.count <= limit;
  
  return {
    success,
    limit,
    remaining,
    reset: record.resetAt
  };
}
