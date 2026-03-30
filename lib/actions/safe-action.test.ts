import { describe, expect, it, vi } from "vitest";

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

import { auth } from "@/lib/auth";
import { createSafeAction, createSafeQuery } from "./safe-action";

const mockGetSession = vi.mocked(auth.api.getSession);

describe("createSafeAction", () => {
  it("should return auth error when session is null", async () => {
    mockGetSession.mockResolvedValue(null as never);

    const action = createSafeAction<string, void>(
      async (_input, _userId) => {},
      { errorMessage: "Failed" },
    );

    const result = await action("test");
    expect(result).toEqual({
      success: false,
      error: "Please sign in to continue",
    });
  });

  it("should call handler with input and userId on valid session", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-123" },
      session: {},
    } as never);

    const handler = vi.fn().mockResolvedValue({ id: "item-1" });
    const action = createSafeAction(handler, {
      errorMessage: "Failed",
    });

    const result = await action("test-input");

    expect(handler).toHaveBeenCalledWith("test-input", "user-123");
    expect(result).toEqual({
      success: true,
      data: { id: "item-1" },
    });
  });

  it("should catch handler errors and return error result", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-123" },
      session: {},
    } as never);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const action = createSafeAction<string, void>(
      async () => {
        throw new Error("DB connection failed");
      },
      { errorMessage: "Operation failed" },
    );

    const result = await action("test");

    expect(result).toEqual({
      success: false,
      error: "DB connection failed",
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "[SafeAction] Operation failed:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("should handle void return from handler", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-123" },
      session: {},
    } as never);

    const action = createSafeAction<string, void>(
      async (_input, _userId) => {},
      { errorMessage: "Failed" },
    );

    const result = await action("test");
    expect(result).toEqual({
      success: true,
      data: undefined,
    });
  });
});

describe("createSafeQuery", () => {
  it("should return auth error when session is null", async () => {
    mockGetSession.mockResolvedValue(null as never);

    const query = createSafeQuery(async (_userId) => [], {
      errorMessage: "Failed to fetch",
    });

    const result = await query();
    expect(result).toEqual({
      success: false,
      error: "Please sign in to continue",
    });
  });

  it("should call handler with userId only", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-456" },
      session: {},
    } as never);

    const handler = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const query = createSafeQuery(handler, {
      errorMessage: "Failed to fetch",
    });

    const result = await query();

    expect(handler).toHaveBeenCalledWith("user-456");
    expect(result).toEqual({
      success: true,
      data: [{ id: 1 }, { id: 2 }],
    });
  });

  it("should catch handler errors and return error result", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-456" },
      session: {},
    } as never);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const query = createSafeQuery(
      async () => {
        throw new Error("Query timeout");
      },
      { errorMessage: "Failed to fetch data" },
    );

    const result = await query();

    expect(result).toEqual({
      success: false,
      error: "Query timeout",
    });

    consoleSpy.mockRestore();
  });
});
