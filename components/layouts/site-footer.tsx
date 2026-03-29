import { Wallet } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="py-8 border-t bg-muted/30">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground max-w-6xl px-4">
        <div className="flex items-center gap-2 font-semibold">
          <Wallet className="h-5 w-5" />
          AssetLens
        </div>
        <nav
          className="flex items-center gap-4 text-xs"
          aria-label="フッターナビゲーション"
        >
          <Link
            href="/terms"
            className="hover:underline hover:text-foreground transition-colors"
          >
            利用規約
          </Link>
          <Link
            href="/privacy"
            className="hover:underline hover:text-foreground transition-colors"
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/contact"
            className="hover:underline hover:text-foreground transition-colors"
          >
            お問い合わせ
          </Link>
        </nav>
        <p>© 2026 AssetLens. All rights reserved.</p>
      </div>
    </footer>
  );
}
