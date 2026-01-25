import { resend } from "@/lib/mail/client";
import { getOtpEmailTemplate } from "@/lib/mail/templates/auth-opt";

export async function sendOtpEmail(email: string, otp: string) {
  const htmlContent = getOtpEmailTemplate(otp);

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "【AssetLens】認証コードのお知らせ",
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error("メール送信に失敗しました");
  }
}
