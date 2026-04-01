import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitTier = "write" | "read" | "ai" | "contact";

const TIER_LIMITS: Record<RateLimitTier, { requests: number; window: string }> =
  {
    write: { requests: 30, window: "60 s" },
    read: { requests: 60, window: "60 s" },
    ai: { requests: 10, window: "60 s" },
    contact: { requests: 5, window: "60 s" },
  };

function createRedisRateLimiter(tier: RateLimitTier): Ratelimit {
  const { requests, window } = TIER_LIMITS[tier];
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window as `${number} s`),
    analytics: true,
    prefix: `ratelimit:${tier}`,
  });
}

let limiters: Partial<Record<RateLimitTier, Ratelimit>> = {};

function getLimiter(tier: RateLimitTier): Ratelimit | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }

  if (!limiters[tier]) {
    limiters[tier] = createRedisRateLimiter(tier);
  }
  return limiters[tier];
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
};

/**
 * Check rate limit for a given identifier and tier.
 * Returns allowed=true when Redis is not configured (fail-open).
 */
export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = "write",
): Promise<RateLimitResult> {
  const limiter = getLimiter(tier);

  if (!limiter) {
    return { allowed: true, remaining: -1, resetAt: new Date() };
  }

  const { success, remaining, reset } = await limiter.limit(identifier);
  return {
    allowed: success,
    remaining,
    resetAt: new Date(reset),
  };
}

/** Reset limiter cache (for testing). */
export function _resetLimiters() {
  limiters = {};
}
