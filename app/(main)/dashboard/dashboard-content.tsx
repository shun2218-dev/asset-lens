import { Suspense } from "react";
import {
  DashboardChartsSkeleton,
  DashboardOverviewSkeleton,
  DashboardWidgetsSkeleton,
} from "@/components/layouts/page-skeletons";
import { DashboardChartsContent } from "./dashboard-charts-content";
import { DashboardOverviewContent } from "./dashboard-overview-content";
import { DashboardWidgetsContent } from "./dashboard-widgets-content";

interface DashboardContentProps {
  currentMonth: string;
}

/**
 * Dashboard with granular Suspense boundaries.
 * Each section (overview, charts, widgets) loads independently.
 */
export function DashboardContent({ currentMonth }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardOverviewSkeleton />}>
        <DashboardOverviewContent currentMonth={currentMonth} />
      </Suspense>
      <Suspense fallback={<DashboardChartsSkeleton />}>
        <DashboardChartsContent currentMonth={currentMonth} />
      </Suspense>
      <Suspense fallback={<DashboardWidgetsSkeleton />}>
        <DashboardWidgetsContent currentMonth={currentMonth} />
      </Suspense>
    </div>
  );
}
