"use client";

import { LogIn, LogOut, Settings, User, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useSession } from "@/lib/auth/auth-client";
import { Skeleton } from "./ui/skeleton";

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto max-w-6xl px-4">
        {/* 左側: ロゴとナビゲーション */}
        <div className="flex items-center gap-6">
          <Link
            href={session ? "/dashboard" : "/"}
            className="flex items-center gap-2 font-bold text-xl"
          >
            <Wallet className="h-6 w-6 text-primary" />
            <span>AssetLens</span>
          </Link>
          {/* ログイン済み */}
          {!isPending && session && (
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link
                href="/dashboard"
                className={
                  pathname === "/dashboard"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                ダッシュボード
              </Link>
              <Link
                href="/transactions"
                className={
                  pathname === "/transactions"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                取引一覧
              </Link>
              <Link
                href="/settings"
                className={
                  pathname.startsWith("/settings")
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                設定
              </Link>
            </nav>
          )}
        </div>

        {/* 右側: ユーザーメニュー */}
        <div className="flex items-center gap-2">
          {isPending ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : session ? (
            // ログイン済み
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name}
                    />
                    <AvatarFallback>
                      {session.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    設定
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    プロフィール
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // ▼ 未ログイン: ログインボタン
            <Button asChild variant="default" size="sm">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                ログイン
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
