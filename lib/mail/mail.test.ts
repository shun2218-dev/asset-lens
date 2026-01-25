import { beforeEach, describe, expect, it, vi } from "vitest";
import { resend } from "./client";
import { sendOtpEmail } from "./index";

// Mock resend client
vi.mock("./client", () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

describe("Mail: sendOtpEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send email with correct parameters", async () => {
    const email = "test@example.com";
    const otp = "123456";

    await sendOtpEmail(email, otp);

    expect(resend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: expect.stringContaining("認証コード"),
        html: expect.stringContaining(otp),
      }),
    );
  });

  it("should throw error if sending fails", async () => {
    (resend.emails.send as any).mockRejectedValue(new Error("Send Error"));

    await expect(sendOtpEmail("test@example.com", "123")).rejects.toThrow(
      "メール送信に失敗しました",
    );
  });
});
