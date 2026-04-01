import { describe, expect, it, vi } from "vitest";

vi.mock("pino", () => {
  const mockLogger = {
    child: vi.fn().mockReturnThis(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
  return { default: vi.fn(() => mockLogger) };
});

describe("logger", () => {
  it("should export log methods", async () => {
    const { log } = await import("@/lib/logger");
    expect(log.info).toBeDefined();
    expect(log.warn).toBeDefined();
    expect(log.error).toBeDefined();
    expect(log.debug).toBeDefined();
  });

  it("should export requestContext (AsyncLocalStorage)", async () => {
    const { requestContext } = await import("@/lib/logger");
    expect(requestContext).toBeDefined();
    expect(requestContext.run).toBeDefined();
  });

  it("should propagate context through AsyncLocalStorage", async () => {
    const { requestContext } = await import("@/lib/logger");

    await requestContext.run(
      { correlationId: "test-123", userId: "user-1" },
      async () => {
        const store = requestContext.getStore();
        expect(store?.correlationId).toBe("test-123");
        expect(store?.userId).toBe("user-1");
      },
    );
  });

  it("should return empty store outside of context", async () => {
    const { requestContext } = await import("@/lib/logger");
    const store = requestContext.getStore();
    expect(store).toBeUndefined();
  });
});
