import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { createCustomCategory } from "./create";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: "user-123" },
      }),
    },
  },
}));

vi.mock("@/db", () => {
  return {
    db: {
      insert: vi.fn(),
    },
  };
});

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

describe("createCustomCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully create a category", async () => {
    const valuesMock = vi.fn().mockResolvedValue([{ id: "cat-123" }]);
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createCustomCategory("My Category");

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalled();
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "My Category",
        type: "expense",
        userId: "user-123",
      }),
    );
  });

  it("should return error if unauthorized", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    const result = await createCustomCategory("My Category");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Please sign in to continue");
    }
  });

  it("should return error if name is empty", async () => {
    const result = await createCustomCategory("  ");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Category name is required");
    }
  });

  it("should return error on database failure", async () => {
    const valuesMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.insert as any).mockReturnValue({ values: valuesMock });

    const result = await createCustomCategory("My Category");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("DB Error");
    }
  });
});
