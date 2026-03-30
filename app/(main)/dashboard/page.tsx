import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ダッシュボード",
  description:
    "月次収支推移、カテゴリ別支出、予算進捗を一目で確認。家計の全体像を把握できるダッシュボード。",
};

import { getStoreRanking } from "@/app/actions/analysis/get-store-ranking";
import { getSummaryWithComparison } from "@/app/actions/analysis/get-summary-with-comparison";
import { getBudgets } from "@/app/actions/budget/get";
import { getCategories } from "@/app/actions/category/get";
import { getTransaction } from "@/app/actions/transaction/get";
import { DashboardView } from "@/components/features/dashboard/dashboard-view";

interface DashboardPageProps {
  searchParams: { month?: string };
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const currentMonth = params.month || new Date().toISOString().slice(0, 7);

  // 6 parallel calls → 4 parallel calls
  // getSummaryWithComparison replaces 2x getSummary + categoryExpenses computation
  const [dashboardSummary, recentData, storeRanking, categories, budgets] =
    await Promise.all([
      getSummaryWithComparison(currentMonth),
      getTransaction(1, currentMonth),
      getStoreRanking(currentMonth),
      getCategories(),
      getBudgets(),
    ]);

  const { data: recentTransactions } = recentData;

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
