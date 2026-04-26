import { afterEach, describe, expect, it, vi } from "vitest";

// ─── mocks ──────────────────────────────────────────────────────

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
};

vi.mock("@/db", () => ({ db: mockDb }));
vi.mock("@/db/schema", () => ({
  contactInquiry: { id: "id", status: "status" },
  inquiryReply: { inquiryId: "inquiry_id", createdAt: "created_at" },
}));

vi.mock("@/lib/auth/admin-guard", () => ({
  requireAdmin: vi.fn().mockResolvedValue({
    user: { id: "admin-1", email: "admin@example.com" },
  }),
}));

const mockSend = vi.fn().mockResolvedValue({ id: "email-1" });
vi.mock("@/lib/mail/client", () => ({
  resend: { emails: { send: mockSend } },
}));

vi.mock("@/lib/mail/templates/inquiry-reply", () => ({
  getInquiryReplyTemplate: vi.fn().mockReturnValue("<html>reply</html>"),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ─── import after mocks ──────────────────────────────────────────

const { replyToInquiry } = await import("./reply");

// ─── tests ──────────────────────────────────────────────────────

describe("replyToInquiry", () => {
  const validInput = {
    inquiryId: "550e8400-e29b-41d4-a716-446655440000",
    subject: "Re: ご質問について",
    body: "お問い合わせありがとうございます。",
  };

  afterEach(() => {
    vi.clearAllMocks();
    // reset default chain
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.limit.mockReturnValue([
      {
        id: validInput.inquiryId,
        name: "テスト太郎",
        email: "user@example.com",
        category: "question",
        message: "テスト質問",
        status: "new",
      },
    ]);
    mockDb.insert.mockReturnThis();
    mockDb.values.mockResolvedValue(undefined);
    mockDb.update.mockReturnThis();
    mockDb.set.mockReturnThis();
  });

  it("should validate required fields", async () => {
    const result = await replyToInquiry({
      inquiryId: "not-uuid",
      subject: "",
      body: "",
    });
    expect(result.success).toBe(false);
  });

  it("should return error when inquiry not found", async () => {
    mockDb.limit.mockReturnValueOnce([]);
    const result = await replyToInquiry(validInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("見つかりません");
    }
  });

  it("should send email and save reply", async () => {
    mockDb.limit.mockReturnValueOnce([
      {
        id: validInput.inquiryId,
        name: "テスト太郎",
        email: "user@example.com",
        category: "question",
        message: "テスト質問",
        status: "new",
      },
    ]);

    const result = await replyToInquiry(validInput);
    expect(result.success).toBe(true);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: expect.stringContaining("AssetLens"),
        replyTo: expect.stringContaining(`reply+${validInput.inquiryId}@`),
      }),
    );
    // Should insert reply record with direction
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: "outbound",
        senderEmail: "admin@example.com",
      }),
    );
  });

  it("should auto-update status from new to in_progress", async () => {
    mockDb.limit.mockReturnValueOnce([
      {
        id: validInput.inquiryId,
        name: "テスト太郎",
        email: "user@example.com",
        category: "question",
        message: "テスト質問",
        status: "new",
      },
    ]);

    await replyToInquiry(validInput);
    expect(mockDb.update).toHaveBeenCalled();
    expect(mockDb.set).toHaveBeenCalledWith(
      expect.objectContaining({ status: "in_progress" }),
    );
  });

  it("should not update status if already in_progress", async () => {
    mockDb.limit.mockReturnValueOnce([
      {
        id: validInput.inquiryId,
        name: "テスト太郎",
        email: "user@example.com",
        category: "question",
        message: "テスト質問",
        status: "in_progress",
      },
    ]);

    await replyToInquiry(validInput);
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it("should return error when email sending fails", async () => {
    mockDb.limit.mockReturnValueOnce([
      {
        id: validInput.inquiryId,
        name: "テスト太郎",
        email: "user@example.com",
        category: "question",
        message: "テスト質問",
        status: "new",
      },
    ]);
    mockSend.mockRejectedValueOnce(new Error("SMTP failure"));

    const result = await replyToInquiry(validInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("送信に失敗");
    }
  });
});
