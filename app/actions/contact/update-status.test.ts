import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue([]),
            }),
          }),
          limit: vi.fn().mockResolvedValue([{ id: "test-id" }]),
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

vi.mock("@/db/schema", () => ({
  contactInquiry: {
    id: "id",
    status: "status",
    category: "category",
    createdAt: "created_at",
  },
}));

vi.mock("@/lib/auth/admin-guard", () => ({
  requireAdmin: vi.fn().mockResolvedValue({
    user: { id: "admin-1", email: "admin@test.com", name: "Admin" },
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("updateInquiryStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject invalid status", async () => {
    const { updateInquiryStatus } = await import(
      "@/app/actions/contact/update-status"
    );
    const result = await updateInquiryStatus({
      id: "550e8400-e29b-41d4-a716-446655440000",
      status: "invalid" as "new",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid UUID", async () => {
    const { updateInquiryStatus } = await import(
      "@/app/actions/contact/update-status"
    );
    const result = await updateInquiryStatus({
      id: "not-a-uuid",
      status: "resolved",
    });
    expect(result.success).toBe(false);
  });

  it("should accept valid input", async () => {
    const { updateInquiryStatus } = await import(
      "@/app/actions/contact/update-status"
    );
    const result = await updateInquiryStatus({
      id: "550e8400-e29b-41d4-a716-446655440000",
      status: "in_progress",
      note: "Working on it",
    });
    expect(result.success).toBe(true);
  });
});
