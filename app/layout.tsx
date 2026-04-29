import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ViewTransition } from "react";
import "./globals.css";
import { Toaster } from "sonner";
import { PullToRefreshProvider } from "@/components/features/pull-to-refresh/pull-to-refresh-provider";
import { KeyboardShortcutProvider } from "@/components/features/shortcuts/keyboard-shortcut-provider";

import { BottomNav } from "@/components/layouts/bottom-nav";
import { SiteFooter } from "@/components/layouts/site-footer";
import { SiteHeader } from "@/components/layouts/site-header";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AssetLens - スマート家計管理",
    template: "%s | AssetLens",
  },
  description:
    "収支を記録・分析して家計を最適化。予算管理、カテゴリ別支出分析、サブスクリプション管理など、暮らしのお金を見える化するパーソナルファイナンスアプリ。",
  keywords: [
    "家計簿",
    "家計管理",
    "収支管理",
    "予算管理",
    "支出分析",
    "asset management",
  ],
  authors: [{ name: "AssetLens" }],
  creator: "AssetLens",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://asset-lens.vercel.app",
  ),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "AssetLens",
    title: "AssetLens - スマート家計管理",
    description:
      "収支を記録・分析して家計を最適化するパーソナルファイナンスアプリ。",
  },
  twitter: {
    card: "summary_large_image",
    title: "AssetLens - スマート家計管理",
    description:
      "収支を記録・分析して家計を最適化するパーソナルファイナンスアプリ。",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AssetLens",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a href="#main-content" className="skip-to-content">
            メインコンテンツへスキップ
          </a>
          {/* Pure-HTML splash — runs before React hydration, no flicker on revisits.
              dangerouslySetInnerHTML is safe here: the string is a static literal
              with zero user input, identical to hardcoding a <script> tag. */}
          <div id="splash" aria-hidden="true">
            <div className="splash-logo">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                role="img"
                aria-label="AssetLens logo"
              >
                <title>AssetLens</title>
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
              </svg>
            </div>
            <h1 className="splash-title">AssetLens</h1>
            <p className="splash-tagline">スマート家計管理</p>
          </div>
          <script
            dangerouslySetInnerHTML={{
              __html: [
                "(function(){",
                '  var s=document.getElementById("splash");',
                "  if(!s)return;",
                '  if(sessionStorage.getItem("asset-lens-splash-shown")){s.remove();return}',
                '  sessionStorage.setItem("asset-lens-splash-shown","1");',
                '  setTimeout(function(){s.classList.add("splash-exit")},1500);',
                "  setTimeout(function(){s.remove()},2000);",
                "})();",
              ].join(""),
            }}
          />
          <KeyboardShortcutProvider>
            <SiteHeader />
            <main id="main-content">
              <PullToRefreshProvider>
                <ViewTransition name="page-content">{children}</ViewTransition>
              </PullToRefreshProvider>
            </main>
            <Toaster />
            <BottomNav />
            <SiteFooter />
          </KeyboardShortcutProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
