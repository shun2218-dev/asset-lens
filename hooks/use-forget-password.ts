"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";

export function useForgetPassword() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Step 1: Send OTP ---
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
      setStep("otp");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 2: Verify OTP ---
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await authClient.emailOtp.checkVerificationOtp({
        email,
        otp,
        type: "forget-password",
      });

      if (error) {
        toast.error("コードが正しくありません");
        return;
      }

      setStep("password");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 3: Reset Password ---
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("パスワードが一致しません");
      return;
    }
    setIsLoading(true);
    try {
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

  return {
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
  };
}
