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
};

interface Props {
  currentMonth: string;
}

export async function DashboardWidgetsContent({ currentMonth }: Props) {
  const [summaryResult, recentResult, rankingResult, budgets] =
    await Promise.all([
      getSummaryWithComparison(currentMonth),
      getTransaction({ page: 1, month: currentMonth }),
      getStoreRanking(currentMonth),
      getBudgets(),
    ]);

  const data = summaryResult.success
    ? summaryResult.data
    : { ...EMPTY_DASHBOARD, currentMonth };
  const storeRanking = rankingResult.success ? rankingResult.data : [];
  const { data: recentTransactions } = recentResult.success
    ? recentResult.data
    : { data: [] };

  return (
    <DashboardWidgets
      recentTransactions={recentTransactions}
      storeRanking={storeRanking}
      budgets={budgets}
      categoryExpenses={data.categoryExpenses}
      totalExpense={data.summary.totalExpense}
      currentMonth={data.currentMonth}
    />
  );
}
