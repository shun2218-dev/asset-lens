import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { updateProfile } from "./update";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
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

vi.mock("@/db", () => ({
  db: {
    update: vi.fn(),
  },
}));

vi.mock("@vercel/blob", () => ({
  put: vi.fn().mockResolvedValue({
    url: "https://blob.example.com/avatar.jpg",
  }),
}));

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

describe("updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully update profile name", async () => {
    const whereMock = vi.fn().mockResolvedValue([]);
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    (db.update as any).mockReturnValue({ set: setMock });

    const formData = new FormData();
    formData.set("name", "新しい名前");

    const result = await updateProfile(formData);

    expect(result.success).toBe(true);
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "新しい名前" }),
    );
  });

  it("should return error if not authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    const formData = new FormData();
    formData.set("name", "Test");

    const result = await updateProfile(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe("ログインしてください");
  });

  it("should fail validation with empty name", async () => {
    const formData = new FormData();
    formData.set("name", "");

    const result = await updateProfile(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should handle database errors", async () => {
    const setMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.update as any).mockReturnValue({ set: setMock });

    const formData = new FormData();
    formData.set("name", "Test User");

    const result = await updateProfile(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe("プロフィールの更新に失敗しました");
  });
});
