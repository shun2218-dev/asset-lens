"use client";

import { ArrowLeft, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";
import { SECURITY_CONFIG } from "@/lib/constants";

export function ForgetPasswordForm() {
  const router = useRouter();
  // ステップを3段階に分けます
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Step 1: メール送信 ---
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await authClient.forgetPassword.emailOtp({ email });
      if (error) {
        toast.error("送信に失敗しました", { description: error.message });
        return;
      }
      toast.success("認証コードを送信しました");
      setStep("otp"); // OTP入力画面へ
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 2: OTP検証 (ここを追加！) ---
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 検証だけ行う
      const { error } = await authClient.emailOtp.checkVerificationOtp({
        email,
        otp,
        type: "forget-password", // typeの指定が必要です
      });

      if (error) {
        toast.error("コードが正しくありません");
        return;
      }

      // 検証OKならパスワード入力画面へ
      setStep("password");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 3: パスワードリセット実行 ---
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("パスワードが一致しません");
      return;
    }
    setIsLoading(true);
    try {
      // ここでも otp は必要です
      const { error } = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password: newPassword,
      });

      if (error) {
        toast.error("リセットに失敗しました", { description: error.message });
        return;
      }

      toast.success("パスワードを変更しました");
      router.push("/login");
    } catch {
      toast.error("予期せぬエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>パスワードを忘れた場合</CardTitle>
        <CardDescription>
          {step === "email" && "登録メールアドレスを入力してください。"}
          {step === "otp" &&
            `メールに届いた${SECURITY_CONFIG.otp.length}桁の認証コードを入力してください。`}
          {step === "password" && "新しいパスワードを設定してください。"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Step 1: メール入力フォーム */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              コードを送信
            </Button>
          </form>
        )}

        {/* Step 2: OTP入力フォーム (shadcn/ui InputOTP) */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={SECURITY_CONFIG.otp.length}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  {Array.from(
                    { length: SECURITY_CONFIG.otp.length },
                    (_, i) => i,
                  ).map((slotIndex) => (
                    <InputOTPSlot key={slotIndex} index={slotIndex} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length < 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              コードを確認
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep("email")}
            >
              メールアドレスを再入力
            </Button>
          </form>
        )}

        {/* Step 3: パスワード入力フォーム */}
        {step === "password" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">新しいパスワード</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="8文字以上"
                  className="pl-9"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">確認用パスワード</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="もう一度入力"
                  className="pl-9"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              パスワードを変更
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button asChild variant="link" className="px-0 text-muted-foreground">
          <Link href="/login" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> ログイン画面に戻る
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
