import { getStoreRanking } from "@/app/actions/analysis/get-store-ranking";
import type { DashboardSummaryResult } from "@/app/actions/analysis/get-summary-with-comparison";
import { getSummaryWithComparison } from "@/app/actions/analysis/get-summary-with-comparison";
import { getBudgets } from "@/app/actions/budget/get";
import { getCategories } from "@/app/actions/category/get";
import { getTransaction } from "@/app/actions/transaction/get";
import { DashboardView } from "@/components/features/dashboard/dashboard-view";

const EMPTY_DASHBOARD: DashboardSummaryResult = {
  currentMonth: "",
  summary: { totalIncome: 0, totalExpense: 0, balance: 0 },
  previousSummary: { totalIncome: 0, totalExpense: 0, balance: 0 },
  categoryStats: [],
  monthlyStats: [],
  categoryExpenses: [],
};

interface DashboardContentProps {
  currentMonth: string;
}

/**
 * Async Server Component that fetches all dashboard data.
 * Rendered inside a Suspense boundary so the page shell streams first.
 */
export async function DashboardContent({
  currentMonth,
}: DashboardContentProps) {
  const [summaryResult, recentResult, rankingResult, categories, budgets] =
    await Promise.all([
      getSummaryWithComparison(currentMonth),
      getTransaction({ page: 1, month: currentMonth }),
      getStoreRanking(currentMonth),
      getCategories(),
      getBudgets(),
    ]);

  const dashboardSummary = summaryResult.success
    ? summaryResult.data
    : { ...EMPTY_DASHBOARD, currentMonth };
  const storeRanking = rankingResult.success ? rankingResult.data : [];
  const { data: recentTransactions } = recentResult.success
    ? recentResult.data
    : { data: [] };

  return (
    <DashboardView
      overview={{
        summary: dashboardSummary.summary,
        previousSummary: dashboardSummary.previousSummary,
        currentMonth: dashboardSummary.currentMonth,
      }}
      charts={{
        monthlyStats: dashboardSummary.monthlyStats,
        categoryStats: dashboardSummary.categoryStats,
        categories,
      }}
      widgets={{
        recentTransactions,
        storeRanking,
        budgets,
        categoryExpenses: dashboardSummary.categoryExpenses,
      }}
    />
  );
}
