import { getCategoryTrends } from "@/app/actions/analysis/get-category-trends";
import { getDailyExpenses } from "@/app/actions/analysis/get-daily-expenses";
import { getStoreRanking } from "@/app/actions/analysis/get-store-ranking";
import type { DashboardSummaryResult } from "@/app/actions/analysis/get-summary-with-comparison";
import { getSummaryWithComparison } from "@/app/actions/analysis/get-summary-with-comparison";
import { getBudgets } from "@/app/actions/budget/get";
import { getTransaction } from "@/app/actions/transaction/get";
import { DashboardWidgets } from "@/components/features/dashboard/dashboard-widgets";

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

export async function DashboardWidgetsContent({ currentMonth }: Props) {
  const [
    summaryResult,
    recentResult,
    rankingResult,
    budgets,
    trendsResult,
    dailyResult,
  ] = await Promise.all([
    getSummaryWithComparison(currentMonth),
    getTransaction({ page: 1, month: currentMonth }),
    getStoreRanking(currentMonth),
    getBudgets(),
    getCategoryTrends(currentMonth),
    getDailyExpenses(currentMonth),
  ]);

  const data = summaryResult.success
    ? summaryResult.data
    : { ...EMPTY_DASHBOARD, currentMonth };
  const storeRanking = rankingResult.success ? rankingResult.data : [];
  const { data: recentTransactions } = recentResult.success
    ? recentResult.data
    : { data: [] };
  const categoryTrends = trendsResult.success ? trendsResult.data : [];
  const dailyExpenses = dailyResult.success ? dailyResult.data : [];

  return (
    <DashboardWidgets
      recentTransactions={recentTransactions}
      storeRanking={storeRanking}
      budgets={budgets}
      categoryExpenses={data.categoryExpenses}
      totalExpense={data.summary.totalExpense}
      currentMonth={data.currentMonth}
      categoryTrends={categoryTrends}
      dailyExpenses={dailyExpenses}
    />
  );
}
