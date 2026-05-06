import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL || "redis://localhost:6379";

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });

  client.on("error", (err) => {
    if (process.env.NODE_ENV !== "test") {
      console.error("[Redis] Connection error:", err.message);
    }
  });

  return client;
}

export const redis =
  globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// ─── Helpers ─────────────────────────────────────────────────

/** Set a value with optional TTL in seconds */
export async function rset(key: string, value: unknown, ttlSeconds?: number) {
  const serialized = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.setex(key, ttlSeconds, serialized);
  } else {
    await redis.set(key, serialized);
  }
}

/** Get a typed value from Redis */
export async function rget<T>(key: string): Promise<T | null> {
  const val = await redis.get(key);
  if (!val) return null;
  try {
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
}

/** Delete a key */
export async function rdel(...keys: string[]) {
  await redis.del(...keys);
}

/** Increment and get value (for counters) */
export async function rincr(key: string, ttlSeconds?: number) {
  const val = await redis.incr(key);
  if (ttlSeconds && val === 1) {
    await redis.expire(key, ttlSeconds);
  }
  return val;
}

// ─── Rate Limiting ───────────────────────────────────────────

export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = `ratelimit:${identifier}`;
  const count = await rincr(key, windowSeconds);
  const ttl = await redis.ttl(key);

  return {
    success: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    reset: Date.now() + ttl * 1000,
  };
}

// ─── Cache keys ──────────────────────────────────────────────

export const CacheKeys = {
  event: (id: string) => `event:${id}`,
  events: (page: number) => `events:page:${page}`,
  eventSlug: (slug: string) => `event:slug:${slug}`,
  trending: () => `events:trending`,
  categories: () => `categories:all`,
  ticketStock: (ticketTypeId: string) => `stock:${ticketTypeId}`,
  userSession: (userId: string) => `session:${userId}`,
  queuePosition: (eventId: string, sessionId: string) =>
    `queue:${eventId}:${sessionId}`,
  queueCount: (eventId: string) => `queue:count:${eventId}`,
};

// ─── Queue room ──────────────────────────────────────────────

export async function addToQueue(eventId: string, sessionId: string): Promise<number> {
  const key = `queue:${eventId}`;
  await redis.zadd(key, Date.now(), sessionId);
  const rank = await redis.zrank(key, sessionId);
  return (rank ?? 0) + 1;
}

export async function getQueuePosition(eventId: string, sessionId: string): Promise<number | null> {
  const key = `queue:${eventId}`;
  const rank = await redis.zrank(key, sessionId);
  if (rank === null) return null;
  return rank + 1;
}

export async function removeFromQueue(eventId: string, sessionId: string) {
  await redis.zrem(`queue:${eventId}`, sessionId);
}

export async function getQueueLength(eventId: string): Promise<number> {
  return redis.zcard(`queue:${eventId}`);
}
