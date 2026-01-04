import { Skeleton } from "@/components/ui/skeleton";

export default function MainLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 md:px-8 py-10 space-y-8">
      {/* ページタイトルエリア */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="h-px bg-border w-full" />

      {/* コンテンツエリア（汎用的なグリッド） */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-50 w-full rounded-xl" />
        <Skeleton className="h-50 w-full rounded-xl" />
        <Skeleton className="h-50 w-full rounded-xl" />
      </div>

      {/* 下部の大きなエリア（テーブルやグラフ用） */}
      <Skeleton className="h-100 w-full rounded-xl" />
    </div>
  );
}
