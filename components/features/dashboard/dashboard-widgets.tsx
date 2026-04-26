"use client";

import type { CategoryTrendItem } from "@/app/actions/analysis/get-category-trends";
import type { DailyExpense } from "@/app/actions/analysis/get-daily-expenses";
import type { ForecastResult } from "@/app/actions/analysis/get-spending-forecast";
import { BudgetProgress } from "@/components/features/dashboard/widgets/budget-progress";
import { CategoryTrends } from "@/components/features/dashboard/widgets/category-trends";
import { ExpenseHeatmap } from "@/components/features/dashboard/widgets/expense-heatmap";
import { RecentTransactions } from "@/components/features/dashboard/widgets/recent-transactions";
import { RecurringPatterns } from "@/components/features/dashboard/widgets/recurring-patterns";
import { SavingsGoalsWidget } from "@/components/features/dashboard/widgets/savings-goals";
import { SpendingForecast } from "@/components/features/dashboard/widgets/spending-forecast";
import { StoreRanking } from "@/components/features/dashboard/widgets/store-ranking";
import type {
  SelectBudget,
  SelectCategory,
  SelectSavingsGoal,
  SelectTransaction,
} from "@/db/schema";

type StoreRankingItem = {
  storeName: string;
  totalAmount: number;
};

type BudgetWithCategory = SelectBudget & {
  category: SelectCategory | null;
};

type DashboardWidgetsProps = {
  recentTransactions: SelectTransaction[];
  storeRanking: StoreRankingItem[];
  budgets: BudgetWithCategory[];
  categoryExpenses: { categoryId: string; amount: number }[];
  totalExpense: number;
  currentMonth: string;
  categoryTrends: CategoryTrendItem[];
  dailyExpenses: DailyExpense[];
  forecast: ForecastResult | null;
  savingsGoals: SelectSavingsGoal[];
};

export function DashboardWidgets({
  recentTransactions,
  storeRanking,
  budgets,
  categoryExpenses,
  totalExpense,
  currentMonth,
  categoryTrends,
  dailyExpenses,
  forecast,
  savingsGoals,
}: DashboardWidgetsProps) {
  return (
    <>
      {/* Budget + Forecast row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BudgetProgress
          budgets={budgets}
          totalExpense={totalExpense}
          categoryExpenses={categoryExpenses}
        />
        {forecast && <SpendingForecast forecast={forecast} />}
      </div>

      {/* Recurring patterns */}
      <RecurringPatterns />

      {/* Heatmap + Trends row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExpenseHeatmap
          dailyExpenses={dailyExpenses}
          currentMonth={currentMonth}
        />
        <CategoryTrends trends={categoryTrends} />
      </div>

      {/* Widget area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StoreRanking data={storeRanking} />
        <RecentTransactions
          transactions={recentTransactions}
          currentMonth={currentMonth}
        />
      </div>

      {/* Savings goals */}
      <SavingsGoalsWidget goals={savingsGoals} />
    </>
  );
}
