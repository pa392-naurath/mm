const memoryStore = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export const applyRateLimit = (key: string, options: RateLimitOptions) => {
  const now = Date.now();
  const current = memoryStore.get(key);

  if (!current || current.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1 };
  }

  if (current.count >= options.limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  memoryStore.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, options.limit - current.count),
    resetAt: current.resetAt,
  };
};
