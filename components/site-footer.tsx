import { Wallet } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="py-8 border-t bg-muted/30">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground  max-w-6xl px-4">
        <div className="flex items-center gap-2 font-semibold">
          <Wallet className="h-5 w-5" />
          AssetLens
        </div>
        <p>© 2026 AssetLens. All rights reserved.</p>
      </div>
    </footer>
  );
}
