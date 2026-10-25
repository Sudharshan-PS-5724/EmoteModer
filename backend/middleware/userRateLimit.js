function userRateLimit({ limit, windowMs, message }) {
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(windowMs) || windowMs < 1000) {
    throw new TypeError('Rate limit and window must be positive integers');
  }

  // Each endpoint owns its window. Chat traffic must not exhaust board creation.
  const windows = new Map();
  let lastPruneAt = 0;
  return (req, res, next) => {
    const userId = req.firebaseUid;
    if (!userId) return res.status(401).json({ message: 'Sign in to continue.' });

    const now = Date.now();
    if (now - lastPruneAt >= windowMs) {
      lastPruneAt = now;
      for (const [key, entry] of windows) {
        if (now - entry.startedAt >= windowMs) windows.delete(key);
      }
    }
    let bucket = windows.get(userId);
    if (!bucket && windows.size >= 10_000) {
      res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
      return res.status(503).json({ message: 'The service is busy. Please try again shortly.' });
    }
    if (!bucket || now - bucket.startedAt >= windowMs) {
      bucket = { startedAt: now, count: 0 };
      windows.set(userId, bucket);
    }

    bucket.count += 1;
    if (bucket.count > limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - bucket.startedAt)) / 1000));
      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ message });
    }

    next();
  };
}

module.exports = userRateLimit;
