import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ダッシュボード",
  description:
    "月次収支推移、カテゴリ別支出、予算進捗を一目で確認。家計の全体像を把握できるダッシュボード。",
};

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

interface DashboardPageProps {
  searchParams: { month?: string };
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const currentMonth = params.month || format(new Date(), "yyyy-MM");

  const [summaryResult, recentData, rankingResult, categories, budgets] =
    await Promise.all([
      getSummaryWithComparison(currentMonth),
      getTransaction(1, currentMonth),
      getStoreRanking(currentMonth),
      getCategories(),
      getBudgets(),
    ]);

  const dashboardSummary = summaryResult.success
    ? summaryResult.data
    : { ...EMPTY_DASHBOARD, currentMonth };
  const storeRanking = rankingResult.success ? rankingResult.data : [];
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
