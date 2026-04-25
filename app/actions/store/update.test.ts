import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { updateStore } from "./update";

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
  return {
    db: {
      select: vi.fn(),
      update: vi.fn(),
    },
  };
});

vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

const VALID_UUID = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

describe("updateStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update store name", async () => {
    let callCount = 0;
    (db.select as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => {
        callCount++;
        if (callCount === 1) {
          // Ownership check - found
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi
                  .fn()
                  .mockResolvedValue([
                    { id: VALID_UUID, name: "旧名", userId: "user-123" },
                  ]),
              }),
            }),
          };
        }
        // Duplicate check - no duplicate
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        };
      },
    );

    const updateWhereMock = vi.fn().mockResolvedValue(undefined);
    const setMock = vi.fn().mockReturnValue({ where: updateWhereMock });
    (db.update as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      set: setMock,
    });

    const result = await updateStore({ id: VALID_UUID, name: "新名" });
    expect(result.success).toBe(true);
  });

  it("should reject non-existent store", async () => {
    (db.select as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const result = await updateStore({ id: VALID_UUID, name: "Test" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("店舗が見つかりません");
    }
  });

  it("should reject empty name", async () => {
    const result = await updateStore({ id: VALID_UUID, name: "" });
    expect(result.success).toBe(false);
  });
});
