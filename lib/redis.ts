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

/** Helper to check if redis is truly connected and usable */
function isRedisAvailable() {
  return redis.status === "ready" || redis.status === "connecting";
}

/** Set a value with optional TTL in seconds */
export async function rset(key: string, value: unknown, ttlSeconds?: number) {
  if (!isRedisAvailable()) return;
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch (err) {
    console.error("[Redis] rset failed:", (err as Error).message);
  }
}

/** Get a typed value from Redis */
export async function rget<T>(key: string): Promise<T | null> {
  if (!isRedisAvailable()) return null;
  try {
    const val = await redis.get(key);
    if (!val) return null;
    return JSON.parse(val) as T;
  } catch (err) {
    console.error("[Redis] rget failed:", (err as Error).message);
    return null;
  }
}

/** Delete a key */
export async function rdel(...keys: string[]) {
  if (!isRedisAvailable()) return;
  try {
    await redis.del(...keys);
  } catch (err) {
    console.error("[Redis] rdel failed:", (err as Error).message);
  }
}

/** Increment and get value (for counters) */
export async function rincr(key: string, ttlSeconds?: number) {
  if (!isRedisAvailable()) return 1; // Default to 1 to allow continuation
  try {
    const val = await redis.incr(key);
    if (ttlSeconds && val === 1) {
      await redis.expire(key, ttlSeconds);
    }
    return val;
  } catch (err) {
    console.error("[Redis] rincr failed:", (err as Error).message);
    return 1;
  }
}

// ─── Rate Limiting ───────────────────────────────────────────

export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number; reset: number }> {
  if (!isRedisAvailable()) {
    return { success: true, remaining: maxRequests, reset: Date.now() + windowSeconds * 1000 };
  }
  
  try {
    const key = `ratelimit:${identifier}`;
    const count = await rincr(key, windowSeconds);
    const ttl = await redis.ttl(key);

    return {
      success: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      reset: Date.now() + (ttl > 0 ? ttl : windowSeconds) * 1000,
    };
  } catch (err) {
    console.error("[Redis] rate limit check failed:", (err as Error).message);
    return { success: true, remaining: maxRequests, reset: Date.now() + windowSeconds * 1000 };
  }
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
  if (!isRedisAvailable()) return 1;
  try {
    const key = `queue:${eventId}`;
    await redis.zadd(key, Date.now(), sessionId);
    const rank = await redis.zrank(key, sessionId);
    return (rank ?? 0) + 1;
  } catch (err) {
    console.error("[Redis] addToQueue failed:", (err as Error).message);
    return 1;
  }
}

export async function getQueuePosition(eventId: string, sessionId: string): Promise<number | null> {
  if (!isRedisAvailable()) return 1;
  try {
    const key = `queue:${eventId}`;
    const rank = await redis.zrank(key, sessionId);
    if (rank === null) return null;
    return rank + 1;
  } catch (err) {
    console.error("[Redis] getQueuePosition failed:", (err as Error).message);
    return 1;
  }
}

export async function removeFromQueue(eventId: string, sessionId: string) {
  if (!isRedisAvailable()) return;
  try {
    await redis.zrem(`queue:${eventId}`, sessionId);
  } catch (err) {
    console.error("[Redis] removeFromQueue failed:", (err as Error).message);
  }
}

export async function getQueueLength(eventId: string): Promise<number> {
  if (!isRedisAvailable()) return 0;
  try {
    return await redis.zcard(`queue:${eventId}`);
  } catch (err) {
    console.error("[Redis] getQueueLength failed:", (err as Error).message);
    return 0;
  }
}
