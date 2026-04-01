import { describe, expect, it, vi } from "vitest";
import { sendContactMessage } from "./send";

// Mock resend
vi.mock("@/lib/mail/client", () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({ id: "test-id" }),
    },
  },
}));

// Mock fetch for reCAPTCHA verification
vi.stubGlobal(
  "fetch",
  vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ success: true, score: 0.9 }),
  }),
);

describe("sendContactMessage", () => {
  it("should send a contact message successfully", async () => {
    const result = await sendContactMessage({
      name: "Test User",
      email: "test@example.com",
      category: "question",
      message: "This is a test message for contact form",
    });

    expect(result.success).toBe(true);
  });

  it("should return error for invalid email", async () => {
    const result = await sendContactMessage({
      name: "Test User",
      email: "invalid-email",
      category: "question",
      message: "This is a test message for contact form",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid email address");
  });

  it("should return error for empty name", async () => {
    const result = await sendContactMessage({
      name: "",
      email: "test@example.com",
      category: "question",
      message: "This is a test message for contact form",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("required");
  });

  it("should return error for short message", async () => {
    const result = await sendContactMessage({
      name: "Test User",
      email: "test@example.com",
      category: "bug",
      message: "Short",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("at least 10");
  });

  it("should return error for invalid category", async () => {
    const result = await sendContactMessage({
      name: "Test User",
      email: "test@example.com",
      category: "invalid" as "question",
      message: "This is a test message for contact form",
    });

    expect(result.success).toBe(false);
  });

  it("should reject bot when reCAPTCHA fails", async () => {
    // Set secret key to enable verification
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "test-secret");

    // Mock fetch to return low score
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: true, score: 0.2 }),
      }),
    );

    const result = await sendContactMessage({
      name: "Bot User",
      email: "bot@example.com",
      category: "other",
      message: "Spam message from a bot trying to abuse",
      recaptchaToken: "fake-token",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Bot verification failed");

    // Cleanup
    vi.unstubAllEnvs();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: true, score: 0.9 }),
      }),
    );
  });

  it("should handle email send failure gracefully", async () => {
    const { resend } = await import("@/lib/mail/client");
    (resend.emails.send as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Send Error"),
    );

    const result = await sendContactMessage({
      name: "Test User",
      email: "test@example.com",
      category: "feature",
      message: "This is a test message for feature request",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to send message");
  });
});
