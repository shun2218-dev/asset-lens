"use client";

import { ArrowLeft, Loader2, Lock } from "lucide-react";
import Link from "next/link";
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
import { useForgetPassword } from "@/hooks/use-forget-password";
import { SECURITY_CONFIG } from "@/lib/constants";

export function ForgetPasswordForm() {
  const {
    step,
    setStep,
    email,
    setEmail,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
  } = useForgetPassword();

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
