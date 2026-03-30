import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { deleteTransaction } from "./delete";

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

vi.mock("@/db", () => {
  return {
    db: {
      delete: vi.fn(),
    },
  };
});

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

describe("deleteTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const transactionId = "tx-123";

  it("should successfully delete a transaction", async () => {
    const whereMock = vi.fn().mockResolvedValue([{ id: transactionId }]);
    (db.delete as any).mockReturnValue({ where: whereMock });

    const result = await deleteTransaction(transactionId);

    expect(result.success).toBe(true);
    expect(db.delete).toHaveBeenCalled();
    expect(whereMock).toHaveBeenCalled();
  });

  it("should handle database errors gracefully", async () => {
    const whereMock = vi.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });
    (db.delete as any).mockReturnValue({ where: whereMock });

    const result = await deleteTransaction(transactionId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("DB Error");
    }
  });
});
