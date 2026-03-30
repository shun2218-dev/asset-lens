import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { updateCategory } from "./update";

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
      update: vi.fn(),
    },
  };
});

vi.mock("@/lib/mail/client", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

describe("updateCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully update a category", async () => {
    const whereMock = vi.fn().mockResolvedValue([{ id: "cat-123" }]);
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.update as any).mockReturnValue({ set: setMock });

    const result = await updateCategory({
      id: "cat-123",
      name: "Updated Name",
      type: "income",
    });

    expect(result.success).toBe(true);
    expect(db.update).toHaveBeenCalled();
  });

  it("should throw error if unauthorized", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    await expect(
      updateCategory({ id: "cat-123", name: "Test", type: "expense" }),
    ).rejects.toThrow("Unauthorized");
  });

  it("should return error if name is empty", async () => {
    const result = await updateCategory({
      id: "cat-123",
      name: "  ",
      type: "expense",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("カテゴリ名を入力してください");
  });

  it("should return error on database failure", async () => {
    const setMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.update as any).mockReturnValue({ set: setMock });

    const result = await updateCategory({
      id: "cat-123",
      name: "Test",
      type: "expense",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("カテゴリの更新に失敗しました");
  });
});
