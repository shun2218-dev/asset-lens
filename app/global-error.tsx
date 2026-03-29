"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="ja">
      <body className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              予期せぬエラーが発生しました
            </h1>
            <p className="text-muted-foreground">
              申し訳ありません。アプリケーションに問題が発生しました。
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={() => reset()} variant="default">
              <RotateCcw className="mr-2 h-4 w-4" />
              再読み込み
            </Button>
            <Button variant="outline" asChild>
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                トップページへ
              </a>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
