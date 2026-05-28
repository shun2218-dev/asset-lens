"use client";

import {
  ArrowLeftRight,
  LayoutDashboard,
  Network,
  Plus,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { getCategories } from "@/app/actions/category/get";
import { getStores } from "@/app/actions/store/get";
import { TransactionForm } from "@/components/features/transaction/transaction-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SelectCategory, SelectStore } from "@/db/schema";
import { useSession } from "@/lib/auth/client";

const navItems = [
  { href: "/dashboard", label: "ホーム", icon: LayoutDashboard },
  { href: "/transaction", label: "取引", icon: ArrowLeftRight },
  { href: "/insights", label: "分析", icon: Network },
  { href: "/settings", label: "設定", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [quickOpen, setQuickOpen] = useState(false);
  const [categories, setCategories] = useState<SelectCategory[]>([]);
  const [stores, setStores] = useState<SelectStore[]>([]);
  const [loaded, setLoaded] = useState(false);

  if (!session) return null;

  const handleQuickEntry = async () => {
    if (!loaded) {
      const [cats, sts] = await Promise.all([getCategories(), getStores()]);
      setCategories(cats);
      setStores(sts);
      setLoaded(true);
    }
    setQuickOpen(true);
  };

  return (
    <>
      <nav
        aria-label="モバイルナビゲーション"
        className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 md:hidden"
        style={{ viewTransitionName: "bottom-nav" }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 2).map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 w-16 min-h-[44px] py-1 text-[10px] transition-colors ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Center: Quick entry FAB */}
          <button
            type="button"
            onClick={handleQuickEntry}
            className="flex items-center justify-center -mt-5 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
            aria-label="取引を記録"
          >
            <Plus className="h-6 w-6" />
          </button>

          {navItems.slice(2).map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 text-[10px] transition-colors ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick entry dialog from bottom nav */}
      <Dialog open={quickOpen} onOpenChange={setQuickOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>取引を記録</DialogTitle>
            <DialogDescription>
              収入・支出の取引情報を入力してください
            </DialogDescription>
          </DialogHeader>
          {loaded ? (
            <TransactionForm
              categories={categories}
              stores={stores}
              onSuccess={() => setQuickOpen(false)}
            />
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
