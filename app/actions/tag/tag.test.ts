import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { createTag, deleteTag, getTags, updateTag } from "./index";

vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({ user: { id: "user-123" } }),
    },
  },
}));
vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: vi.fn() } },
}));

describe("Tag CRUD actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTags", () => {
    it("should return tags for user", async () => {
      const mockTags = [
        { id: "t1", name: "旅行", color: "#ef4444", userId: "user-123" },
      ];
      const orderByMock = vi.fn().mockResolvedValue(mockTags);
      const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
        from: fromMock,
      });

      const result = await getTags();
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data).toEqual(mockTags);
    });
  });

  describe("createTag", () => {
    it("should create a tag", async () => {
      const newTag = {
        id: "t1",
        name: "旅行",
        color: "#ef4444",
        userId: "user-123",
      };
      const returningMock = vi.fn().mockResolvedValue([newTag]);
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
        values: valuesMock,
      });

      const result = await createTag({ name: "旅行", color: "#ef4444" });
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.name).toBe("旅行");
    });
  });

  describe("updateTag", () => {
    it("should update a tag", async () => {
      const updated = {
        id: "t1",
        name: "出張",
        color: "#3b82f6",
        userId: "user-123",
      };
      const returningMock = vi.fn().mockResolvedValue([updated]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: setMock });

      const result = await updateTag({
        id: "t1",
        name: "出張",
        color: "#3b82f6",
      });
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.name).toBe("出張");
    });
  });

  describe("deleteTag", () => {
    it("should delete a tag", async () => {
      const whereMock = vi.fn().mockResolvedValue([]);
      (db.delete as ReturnType<typeof vi.fn>).mockReturnValue({
        where: whereMock,
      });

      const result = await deleteTag("t1");
      expect(result.success).toBe(true);
    });
  });
});
