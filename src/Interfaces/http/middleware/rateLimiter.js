/**
 * Rate Limiter Middleware for /threads and all its child routes
 * Matches Nginx configuration: `limit_req_zone $binary_remote_addr zone=threads_limit:10m rate=90r/m;`
 * Rate: 90 requests per minute (0.0015 requests per ms)
 * Applied to `/threads` and all child routes (/threads, /threads/:id, /threads/:id/comments, etc.)
 */

import pool from '../../../Infrastructures/database/postgres/pool.js';

let isTableInitialized = false;

async function ensureRateLimitTable() {
  if (!isTableInitialized) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rate_limits (
          ip VARCHAR(100) PRIMARY KEY,
          tokens NUMERIC NOT NULL,
          last_time BIGINT NOT NULL
        );
      `);
      isTableInitialized = true;
    } catch {
      // Ignored if table creation fails or already exists
    }
  }
}

// Fallback in-memory leaky bucket
const memoryClients = new Map();
const ratePerMs = 90 / 60000;
const ratePerMsStr = ratePerMs.toString();
const BURST_LIMIT = 1;

function memoryConsume(ip) {
  const now = Date.now();
  let record = memoryClients.get(ip);
  if (!record) {
    record = { tokens: 0, lastTime: now };
    memoryClients.set(ip, record);
  }

  const elapsed = now - record.lastTime;
  record.tokens = Math.max(0, record.tokens - (elapsed * ratePerMs));
  record.lastTime = now;

  if (record.tokens + 1 > BURST_LIMIT) {
    return false;
  }

  record.tokens += 1;
  return true;
}

const threadsRateLimiter = async (req, res, next) => {
  // Skip rate limiting during local unit/integration test suites
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // Extract client IP from proxy headers or direct socket
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = forwarded ? forwarded.split(',')[0].trim() : (req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1');

  try {
    await ensureRateLimitTable();
    const now = Date.now();

    const result = await pool.query(`
      INSERT INTO rate_limits (ip, tokens, last_time)
      VALUES ($1, 1.0, $2)
      ON CONFLICT (ip) DO UPDATE
      SET 
        tokens = GREATEST(0.0, rate_limits.tokens - (($2 - rate_limits.last_time) * $3::numeric)) + 1.0,
        last_time = $2
      RETURNING tokens;
    `, [clientIp, now, ratePerMsStr]);

    const currentTokens = parseFloat(result.rows[0].tokens);

    if (currentTokens > BURST_LIMIT) {
      res.setHeader('Retry-After', '1');
      return res.status(429).json({
        status: 'fail',
        message: 'Too Many Requests: limit access pada endpoint /threads dan turunannya telah tercapai. Silakan coba beberapa saat lagi.',
      });
    }
  } catch {
    // If database connection is unavailable, fallback to in-memory limiter
    const allowed = memoryConsume(clientIp);
    if (!allowed) {
      res.setHeader('Retry-After', '1');
      return res.status(429).json({
        status: 'fail',
        message: 'Too Many Requests: limit access pada endpoint /threads dan turunannya telah tercapai. Silakan coba beberapa saat lagi.',
      });
    }
  }

  return next();
};

export default threadsRateLimiter;
