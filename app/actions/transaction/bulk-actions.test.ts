import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { bulkDeleteTransactions, bulkUpdateCategory } from "./bulk-actions";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
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
  const deleteMock = vi.fn();
  const updateMock = vi.fn();
  return {
    db: {
      delete: deleteMock,
      update: updateMock,
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

describe("bulkDeleteTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete multiple transactions", async () => {
    const whereMock = vi.fn().mockResolvedValue({ rowCount: 3 });
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (db.delete as any).mockReturnValue({ where: whereMock });

    const result = await bulkDeleteTransactions({
      ids: [
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002",
        "550e8400-e29b-41d4-a716-446655440003",
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.deletedCount).toBe(3);
    }
    expect(db.delete).toHaveBeenCalled();
  });

  it("should reject empty ids array", async () => {
    const result = await bulkDeleteTransactions({ ids: [] });
    expect(result.success).toBe(false);
  });

  it("should reject invalid UUIDs", async () => {
    const result = await bulkDeleteTransactions({
      ids: ["not-a-uuid"],
    });
    expect(result.success).toBe(false);
  });
});

describe("bulkUpdateCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update category for multiple transactions", async () => {
    const whereMock = vi.fn().mockResolvedValue({ rowCount: 2 });
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (db.update as any).mockReturnValue({ set: setMock });

    const result = await bulkUpdateCategory({
      ids: [
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002",
      ],
      categoryId: "550e8400-e29b-41d4-a716-446655440099",
      categorySlug: "food",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.updatedCount).toBe(2);
    }
    expect(db.update).toHaveBeenCalled();
  });

  it("should reject empty ids", async () => {
    const result = await bulkUpdateCategory({
      ids: [],
      categoryId: "550e8400-e29b-41d4-a716-446655440099",
      categorySlug: "food",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing categoryId", async () => {
    const result = await bulkUpdateCategory({
      ids: ["550e8400-e29b-41d4-a716-446655440001"],
      categoryId: "",
      categorySlug: "food",
    });
    expect(result.success).toBe(false);
  });
});
