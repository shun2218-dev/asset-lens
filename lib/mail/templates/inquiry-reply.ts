/**
 * Sanitize user input to prevent XSS in email body.
 */
function sanitize(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface InquiryReplyTemplateParams {
  recipientName: string;
  originalMessage: string;
  originalCategory: string;
  replyBody: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  question: "質問",
  bug: "バグ報告",
  feature: "機能要望",
  other: "その他",
};

export function getInquiryReplyTemplate({
  recipientName,
  originalMessage,
  originalCategory,
  replyBody,
}: InquiryReplyTemplateParams): string {
  const categoryLabel = CATEGORY_LABELS[originalCategory] ?? originalCategory;

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0; font-weight: 600;">
          💰 AssetLens
        </h1>
        <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0;">
          お問い合わせへのご回答
        </p>
      </div>

      <!-- Body -->
      <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">
          ${sanitize(recipientName)} 様
        </p>

        <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.7; color: #334155;">
          お問い合わせいただきありがとうございます。<br/>
          以下の通り回答いたします。
        </p>

        <!-- Reply content -->
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px 24px; border-radius: 0 8px 8px 0; margin: 0 0 24px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #1e293b; white-space: pre-wrap;">${sanitize(replyBody)}</p>
        </div>

        <!-- Original inquiry -->
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b; margin: 0 0 8px; font-weight: 600;">
            ─ 元のお問い合わせ（${sanitize(categoryLabel)}）─
          </p>
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 13px; color: #475569; line-height: 1.6; white-space: pre-wrap;">
            ${sanitize(originalMessage)}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; padding: 20px 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">
          このメールは AssetLens サポートチームからの自動送信です。<br/>
          ご不明な点がございましたら、再度お問い合わせフォームよりご連絡ください。
        </p>
      </div>
    </div>
  `;
}
