"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            エラーが発生しました
          </h1>
          <p className="text-muted-foreground">
            ページの読み込み中に問題が発生しました。再度お試しください。
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={() => reset()} variant="default">
            <RotateCcw className="mr-2 h-4 w-4" />
            再試行
          </Button>
          <Button variant="outline" asChild>
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              トップページへ
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
