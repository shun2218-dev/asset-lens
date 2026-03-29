import { format, subMonths } from "date-fns";
import { getStoreRanking } from "@/app/actions/analysis/get-store-ranking";
import { getSummary } from "@/app/actions/analysis/get-summary";
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
  const now = new Date();
  const defaultMonth = format(now, "yyyy-MM");
  const currentMonth = params.month || defaultMonth;

  // Calculate previous month for MoM comparison
  const [year, month] = currentMonth.split("-").map(Number);
  const prevDate = subMonths(new Date(year, month - 1, 1), 1);
  const previousMonth = format(prevDate, "yyyy-MM");

  const [
    recentData,
    summaryData,
    prevSummaryData,
    categories,
    storeRanking,
    budgets,
  ] = await Promise.all([
    getTransaction(1, currentMonth),
    getSummary(currentMonth),
    getSummary(previousMonth),
    getCategories(),
    getStoreRanking(currentMonth),
    getBudgets(),
  ]);

  const { data: recentTransactions } = recentData;
  const { summary, categoryStats, monthlyStats } = summaryData;
  const { summary: previousSummary } = prevSummaryData ?? {
    summary: { totalIncome: 0, totalExpense: 0, balance: 0 },
  };

  // Build categoryExpenses for budget progress from categoryStats
  const categoryExpenses = categoryStats.map((cs) => {
    const cat = categories.find(
      (c) => c.id === cs.category || c.slug === cs.category,
    );
    return {
      categoryId: cat?.id ?? "",
      amount: cs.amount,
    };
  });

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
      budgets={budgets}
      categoryExpenses={categoryExpenses}
    />
  );
}
