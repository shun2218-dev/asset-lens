import type { Metadata } from "next";
import { ForgetPasswordForm } from "@/components/auth/forget-password-form";

export const metadata: Metadata = {
  title: "パスワードのリセット | AssetLens",
  description: "パスワードを忘れた場合の再設定",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ForgetPasswordForm />
    </div>
  );
}
