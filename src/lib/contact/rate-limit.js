// Small, dependency-free, in-memory sliding-window rate limiter.
// Suitable for a single-instance, low-volume contact function. For a
// multi-instance deployment, back this with shared storage (see docs).
export class RateLimiter {
  constructor({ windowMs = 60_000, max = 5 } = {}) {
    if (windowMs <= 0) throw new RangeError('windowMs must be positive');
    if (max <= 0) throw new RangeError('max must be positive');
    this.windowMs = windowMs;
    this.max = max;
    this.hits = new Map();
  }

  // Record a hit for `key` and return whether it is within the allowed budget.
  consume(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const entries = this.hits.get(key) || [];
    const recent = entries.filter((timestamp) => timestamp > windowStart);
    recent.push(now);
    if (recent.length > this.max) {
      this.hits.set(key, recent);
      return false;
    }
    this.hits.set(key, recent);
    return true;
  }

  reset() {
    this.hits.clear();
  }
}
