import { format, subMonths } from "date-fns";
import { getStoreRanking } from "@/app/actions/analysis/get-store-ranking";
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
  const now = new Date();
  const defaultMonth = format(now, "yyyy-MM");
  const currentMonth = params.month || defaultMonth;

  // Calculate previous month for MoM comparison
  const [year, month] = currentMonth.split("-").map(Number);
  const prevDate = subMonths(new Date(year, month - 1, 1), 1);
  const previousMonth = format(prevDate, "yyyy-MM");

  const [recentData, summaryData, prevSummaryData, categories, storeRanking] =
    await Promise.all([
      getTransaction(1, currentMonth), // Recent 10 items
      getSummary(currentMonth),
      getSummary(previousMonth),
      getCategories(),
      getStoreRanking(currentMonth),
    ]);

  const { data: recentTransactions } = recentData;
  const { summary, categoryStats, monthlyStats } = summaryData;
  const { summary: previousSummary } = prevSummaryData;

  return (
    <DashboardView
      summary={summary}
      previousSummary={previousSummary}
      monthlyStats={monthlyStats}
      categoryStats={categoryStats}
      currentMonth={currentMonth}
      recentTransactions={recentTransactions}
      storeRanking={storeRanking}
      categories={categories}
    />
  );
}
