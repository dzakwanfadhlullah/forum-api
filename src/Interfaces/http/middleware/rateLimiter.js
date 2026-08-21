/**
 * Rate Limiter Middleware
 * Simulates Nginx `limit_req_zone $binary_remote_addr zone=threads_limit:10m rate=90r/m burst=10 nodelay;`
 * Rate: 90 requests / minute (1.5 req/sec)
 * Burst: 10 requests
 * Applied to `/threads` and all its child routes (/threads/:id, /threads/:id/comments, /threads/:id/comments/:id/replies, /threads/:id/comments/:id/likes)
 */

class NginxLeakyBucket {
  constructor({ ratePerMinute = 90, burst = 10 } = {}) {
    this._ratePerMs = ratePerMinute / (60 * 1000); // 0.0015 tokens per ms
    this._burst = burst;
    this._clients = new Map(); // ip -> { tokens, lastTime }

    // Periodic cleanup every 5 minutes to prevent memory leak
    setInterval(() => {
      const now = Date.now();
      for (const [ip, record] of this._clients.entries()) {
        if (now - record.lastTime > 60 * 1000) {
          this._clients.delete(ip);
        }
      }
    }, 5 * 60 * 1000).unref();
  }

  consume(ip) {
    const now = Date.now();
    let record = this._clients.get(ip);
    if (!record) {
      record = { tokens: 0, lastTime: now };
      this._clients.set(ip, record);
    }

    // Drain tokens based on elapsed time
    const elapsed = now - record.lastTime;
    record.tokens = Math.max(0, record.tokens - (elapsed * this._ratePerMs));
    record.lastTime = now;

    // Check if adding this request exceeds burst limit
    if (record.tokens + 1 > this._burst) {
      return false; // Rate limit exceeded
    }

    record.tokens += 1;
    return true; // Allowed
  }
}

const limiterInstance = new NginxLeakyBucket({ ratePerMinute: 90, burst: 10 });

const threadsRateLimiter = (req, res, next) => {
  // Skip during unit/integration tests if specified
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // Get Client IP (supporting proxy headers X-Forwarded-For / X-Real-IP)
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = forwarded ? forwarded.split(',')[0].trim() : (req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1');

  const allowed = limiterInstance.consume(clientIp);

  if (!allowed) {
    res.setHeader('Retry-After', '1');
    return res.status(429).json({
      status: 'fail',
      message: 'Too Many Requests: limit access pada endpoint /threads dan turunannya telah tercapai. Silakan coba beberapa saat lagi.',
    });
  }

  return next();
};

export default threadsRateLimiter;
