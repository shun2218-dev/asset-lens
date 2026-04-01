import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton for the summary cards section */
export function DashboardOverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for the charts section */
export function DashboardChartsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for the widgets section */
export function DashboardWidgetsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Budget progress */}
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-6 w-full rounded" />
        <Skeleton className="h-6 w-full rounded" />
      </div>
      {/* Store ranking + Recent transactions */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6 animate-pulse">
      {/* Month Selector */}
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>

      {/* Widgets */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6 animate-pulse">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border bg-card p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-center justify-between rounded-lg border bg-card p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex items-center justify-between rounded-lg border bg-card p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-center justify-between rounded-lg border bg-card p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-18" />
        </div>
        <div className="flex items-center justify-between rounded-lg border bg-card p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  );
}
