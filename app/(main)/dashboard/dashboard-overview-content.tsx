import type { DashboardSummaryResult } from "@/app/actions/analysis/get-summary-with-comparison";
import { getSummaryWithComparison } from "@/app/actions/analysis/get-summary-with-comparison";
import { DashboardOverview } from "@/components/features/dashboard/dashboard-overview";

const EMPTY_DASHBOARD: DashboardSummaryResult = {
  currentMonth: "",
  summary: { totalIncome: 0, totalExpense: 0, balance: 0 },
  previousSummary: { totalIncome: 0, totalExpense: 0, balance: 0 },
  categoryStats: [],
  monthlyStats: [],
  categoryExpenses: [],
};

interface Props {
  currentMonth: string;
}

export async function DashboardOverviewContent({ currentMonth }: Props) {
  const summaryResult = await getSummaryWithComparison(currentMonth);
  const data = summaryResult.success
    ? summaryResult.data
    : { ...EMPTY_DASHBOARD, currentMonth };

  return (
    <DashboardOverview
      summary={data.summary}
      previousSummary={data.previousSummary}
      currentMonth={data.currentMonth}
    />
  );
}
