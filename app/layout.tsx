import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
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
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
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
          <KeyboardShortcutProvider>
            <SiteHeader />
            <main id="main-content">{children}</main>
            <Toaster />
            <BottomNav />
            <SiteFooter />
          </KeyboardShortcutProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
