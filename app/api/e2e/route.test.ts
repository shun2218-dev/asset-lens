import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock db before import
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn().mockReturnValue({
  set: vi.fn().mockReturnValue({
    where: vi.fn(),
  }),
});
const mockDelete = vi.fn().mockReturnValue({
  where: vi.fn(),
});

vi.mock("@/db", () => ({
  db: {
    query: {
      user: {
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

vi.mock("@/db/schema", () => ({
  user: { id: "id", email: "email" },
}));

const { POST } = await import("@/app/api/e2e/route");

describe("E2E test API", () => {
  const originalSecret = process.env.E2E_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.E2E_SECRET = "test-secret";
  });

  afterEach(() => {
    if (originalSecret) {
      process.env.E2E_SECRET = originalSecret;
    } else {
      delete process.env.E2E_SECRET;
    }
  });

  function makeRequest(body: Record<string, unknown>, secret?: string) {
    return new Request("http://localhost:3000/api/e2e", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-e2e-secret": secret } : {}),
      },
      body: JSON.stringify(body),
    });
  }

  it("should return 404 when E2E_SECRET is not set", async () => {
    delete process.env.E2E_SECRET;
    const req = makeRequest({ action: "verify-email" }, "any");
    const res = await POST(req as any);
    expect(res.status).toBe(404);
  });

  it("should return 403 when secret does not match", async () => {
    const req = makeRequest({ action: "verify-email" }, "wrong-secret");
    const res = await POST(req as any);
    expect(res.status).toBe(403);
  });

  it("should verify email successfully", async () => {
    mockFindFirst.mockResolvedValueOnce({ id: "user-1" });
    const req = makeRequest(
      { action: "verify-email", email: "test@example.com" },
      "test-secret",
    );
    const res = await POST(req as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.userId).toBe("user-1");
  });

  it("should return 404 when user not found for verify-email", async () => {
    mockFindFirst.mockResolvedValueOnce(null);
    const req = makeRequest(
      { action: "verify-email", email: "unknown@example.com" },
      "test-secret",
    );
    const res = await POST(req as any);
    expect(res.status).toBe(404);
  });

  it("should return 400 when email is missing for verify-email", async () => {
    const req = makeRequest({ action: "verify-email" }, "test-secret");
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it("should delete user by userId", async () => {
    const req = makeRequest(
      { action: "delete-user", userId: "user-1" },
      "test-secret",
    );
    const res = await POST(req as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDelete).toHaveBeenCalled();
  });

  it("should delete user by email fallback", async () => {
    mockFindFirst.mockResolvedValueOnce({ id: "user-2" });
    const req = makeRequest(
      { action: "delete-user", email: "test@example.com" },
      "test-secret",
    );
    const res = await POST(req as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("should return 400 for unknown action", async () => {
    const req = makeRequest({ action: "unknown" }, "test-secret");
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});
