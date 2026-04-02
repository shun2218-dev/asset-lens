import { describe, expect, it, vi } from "vitest";

const mockInsert = vi.fn();
const mockValues = vi.fn();
const mockReturning = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();
const mockSet = vi.fn();
const mockSelectResult: Array<{ id: string }> = [];

vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => Promise.resolve([]),
        }),
      }),
    }),
    insert: () => {
      mockInsert();
      return {
        values: (v: unknown) => {
          mockValues(v);
          return {
            returning: () => {
              mockReturning();
              return Promise.resolve([{ id: "new-id" }]);
            },
          };
        },
      };
    },
    delete: () => {
      mockDelete();
      return {
        where: () => Promise.resolve(),
      };
    },
    update: () => {
      mockUpdate();
      return {
        set: (v: unknown) => {
          mockSet(v);
          return {
            where: () => Promise.resolve(),
          };
        },
      };
    },
  },
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

vi.mock("next/headers", () => ({
  headers: vi
    .fn()
    .mockResolvedValue(new Map([["x-correlation-id", "test-id"]])),
}));

vi.mock("next/cache", () => ({
  updateTag: vi.fn(),
  unstable_cache: (fn: () => unknown) => fn,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("template actions", () => {
  it("should create a template and return id", async () => {
    const { createTemplate } = await import("./index");
    const result = await createTemplate({
      name: "Rent",
      amount: 80000,
      category: "housing",
      isExpense: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("new-id");
    }
  });

  it("should delete a template", async () => {
    const { deleteTemplate } = await import("./index");
    const result = await deleteTemplate("template-id-1");
    expect(result.success).toBe(true);
  });

  it("should update a template", async () => {
    const { updateTemplate } = await import("./index");
    const result = await updateTemplate({
      id: "template-id-1",
      name: "Updated Rent",
      amount: 85000,
      category: "housing",
      isExpense: true,
    });
    expect(result.success).toBe(true);
  });

  it("should increment template usage", async () => {
    const { incrementTemplateUsage } = await import("./index");
    const result = await incrementTemplateUsage("template-id-1");
    expect(result.success).toBe(true);
  });
});
