"use client";

import { Fingerprint, Loader2 } from "lucide-react";
import { SignInForm } from "@/components/features/auth/sign-in-form";
import { SignUpForm } from "@/components/features/auth/sign-up-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

export function GuestView() {
  const { signInWithPasskey, isLoading, error } = useAuth();

  const handlePasskeySignIn = async () => {
    await signInWithPasskey();
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-primary">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          AssetLens
        </CardTitle>
        <CardDescription>家計簿アプリへようこそ</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Passkey Login Section */}
        <div className="mb-6">
          <Button
            onClick={handlePasskeySignIn}
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold shadow-sm"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Fingerprint className="mr-2 h-5 w-5" />
            )}
            Passkeyでログイン
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            登録済みのデバイス（指紋・顔認証）を使用
          </p>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              またはパスワードを使用
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="signin">ログイン</TabsTrigger>
            <TabsTrigger value="signup">新規登録</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <SignInForm />
          </TabsContent>

          <TabsContent value="signup">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
