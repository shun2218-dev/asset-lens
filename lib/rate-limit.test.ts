import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("rate-limit", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should allow requests when Redis is not configured (fail-open)", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const result = await checkRateLimit("user-1", "write");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(-1);
  });

  it("should allow requests for all tiers when Redis is not configured", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");

    for (const tier of ["write", "read", "ai", "contact"] as const) {
      const result = await checkRateLimit("user-1", tier);
      expect(result.allowed).toBe(true);
    }
  });

  it("should default to write tier", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const result = await checkRateLimit("user-1");
    expect(result.allowed).toBe(true);
  });

  it("should call Ratelimit.limit when Redis is configured", async () => {
    const mockLimit = vi.fn().mockResolvedValue({
      success: true,
      remaining: 29,
      reset: Date.now() + 60000,
    });

    vi.doMock("@upstash/ratelimit", () => ({
      Ratelimit: class {
        limit = mockLimit;
        static slidingWindow = vi.fn().mockReturnValue("limiter");
      },
    }));
    vi.doMock("@upstash/redis", () => ({
      Redis: {
        fromEnv: vi.fn().mockReturnValue({}),
      },
    }));

    process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";

    const { checkRateLimit, _resetLimiters } = await import("@/lib/rate-limit");
    _resetLimiters();

    const result = await checkRateLimit("user-1", "write");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29);
    expect(mockLimit).toHaveBeenCalledWith("user-1");
  });

  it("should block requests when rate limit exceeded", async () => {
    const mockLimit = vi.fn().mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Date.now() + 30000,
    });

    vi.doMock("@upstash/ratelimit", () => ({
      Ratelimit: class {
        limit = mockLimit;
        static slidingWindow = vi.fn().mockReturnValue("limiter");
      },
    }));
    vi.doMock("@upstash/redis", () => ({
      Redis: {
        fromEnv: vi.fn().mockReturnValue({}),
      },
    }));

    process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";

    const { checkRateLimit, _resetLimiters } = await import("@/lib/rate-limit");
    _resetLimiters();

    const result = await checkRateLimit("user-1", "write");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
