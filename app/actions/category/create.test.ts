import { describe, expect, it, vi, beforeEach } from "vitest";
import { createCustomCategory } from "./create";
import { db } from "@/db";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: "user-123" },
      }),
    },
  },
}));

// Mock db
vi.mock("@/db", () => {
  return {
    db: {
      insert: vi.fn(),
    },
  };
});

// Mock mail client to avoid init error
vi.mock("@/lib/mail/client", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

describe("createCustomCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully create a category", async () => {
    // Mock db.insert chain
    const valuesMock = vi.fn().mockResolvedValue([{ id: "cat-123" }]);
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createCustomCategory("My Category");

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalled();
    expect(valuesMock).toHaveBeenCalledWith(expect.objectContaining({
      name: "My Category",
      type: "expense",
      userId: "user-123",
    }));
  });

  it("should throw error if unauthorized", async () => {
    // Override auth mock to return null
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    await expect(createCustomCategory("My Category")).rejects.toThrow("Unauthorized");
  });

  it("should throw error if name is empty", async () => {
    await expect(createCustomCategory("  ")).rejects.toThrow("カテゴリ名を入力してください");
  });

  it("should return error on database failure", async () => {
     // Mock insert failure
    const valuesMock = vi.fn().mockImplementation(() => {
        throw new Error("DB Error");
    });
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createCustomCategory("My Category");

    expect(result.success).toBe(false);
    expect(result.error).toBe("カテゴリの作成に失敗しました");
  });
});
