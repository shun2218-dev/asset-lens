"use client";

import { Loader2 } from "lucide-react";
import { GuestView } from "@/components/features/auth/guest-view";
import { LoggedInView } from "@/components/features/auth/logged-in-view";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";

export function PasskeyAuth() {
  const { data: session, isPending, error } = authClient.useSession();

  // セッション取得中のローディング表示
  if (isPending) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  // エラー時
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10 border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            エラーが発生しました
          </CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // ログイン済みの場合
  if (session) {
    return <LoggedInView session={session} />;
  }

  // 未ログイン（ゲスト）の場合
  return <GuestView />;
}
