import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <p className="text-lg text-muted-foreground">
            ページが見つかりませんでした
          </p>
          <p className="text-sm text-muted-foreground">
            URLが正しいかご確認ください。
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            トップページへ
          </Link>
        </Button>
      </div>
    </div>
  );
}
