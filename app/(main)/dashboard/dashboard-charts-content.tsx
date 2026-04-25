import type { DashboardSummaryResult } from "@/app/actions/analysis/get-summary-with-comparison";
import { getSummaryWithComparison } from "@/app/actions/analysis/get-summary-with-comparison";
import { getCategories } from "@/app/actions/category/get";
import { DashboardCharts } from "@/components/features/dashboard/dashboard-charts";

const EMPTY_DASHBOARD: DashboardSummaryResult = {
  currentMonth: "",
  summary: { totalIncome: 0, totalExpense: 0, balance: 0 },
  previousSummary: { totalIncome: 0, totalExpense: 0, balance: 0 },
  categoryStats: [],
  monthlyStats: [],
  categoryExpenses: [],
  isFallback: false,
  requestedMonth: "",
};

interface Props {
  currentMonth: string;
}

export async function DashboardChartsContent({ currentMonth }: Props) {
  const [summaryResult, categories] = await Promise.all([
    getSummaryWithComparison(currentMonth),
    getCategories(),
  ]);

  const data = summaryResult.success
    ? summaryResult.data
    : { ...EMPTY_DASHBOARD, currentMonth };

  return (
    <DashboardCharts
      monthlyStats={data.monthlyStats}
      categoryStats={data.categoryStats}
      categories={categories}
    />
  );
}
