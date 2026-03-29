import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { deleteUser } from "./delete";

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
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

describe("deleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully delete a user", async () => {
    const whereMock = vi.fn().mockResolvedValue([]);
    (db.delete as any).mockReturnValue({ where: whereMock });

    const result = await deleteUser();

    expect(result.success).toBe(true);
    expect(db.delete).toHaveBeenCalled();
  });

  it("should throw error if not authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    (auth.api.getSession as any).mockResolvedValueOnce(null);

    await expect(deleteUser()).rejects.toThrow("Unauthorized");
  });

  it("should throw error on database failure", async () => {
    const whereMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.delete as any).mockReturnValue({ where: whereMock });

    await expect(deleteUser()).rejects.toThrow("Failed to delete account");
  });
});
