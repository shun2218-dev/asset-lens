import { SECURITY_CONFIG } from "@/lib/constants";
import { resend } from "@/lib/resend";

export async function sendOtpEmail(email: string, otp: string) {
  const expireMinutes = Math.floor(SECURITY_CONFIG.otp.expiresIn / 60);

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "【AssetLens】認証コードのお知らせ",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>認証コード</h2>
          <p>以下のコードを入力して手続きを完了してください。</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background: #f4f4f5; padding: 12px; text-align: center; border-radius: 8px;">
            ${otp}
          </p>
          <p>このコードは <strong>${expireMinutes}分間</strong> 有効です。</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error("メール送信に失敗しました");
  }
}
