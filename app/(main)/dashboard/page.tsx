import { format } from "date-fns";
import { getSummary } from "@/app/actions/analysis/get-summary";
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
  const initialPage = 1;
  const now = new Date();
  const defaultMonth = format(now, "yyyy-MM");
  const currentMonth = params.month || defaultMonth;

  const [transactionsData, summaryData, categories] = await Promise.all([
    getTransaction(initialPage, currentMonth), // リスト用 (10件)
    getSummary(currentMonth), // グラフ・集計用 (全件集計)
    getCategories(), // カテゴリ一覧
  ]);

  const { data: transactions, metadata } = transactionsData;
  const { summary, categoryStats, monthlyStats } = summaryData;

  return (
    <DashboardView
      summary={summary}
      monthlyStats={monthlyStats}
      categoryStats={categoryStats}
      currentMonth={currentMonth}
      transactions={transactions}
      metadata={metadata}
      categories={categories}
    />
  );
}
