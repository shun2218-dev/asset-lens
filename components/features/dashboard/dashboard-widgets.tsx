"use client";

import { BudgetProgress } from "@/components/features/dashboard/widgets/budget-progress";
import { RecentTransactions } from "@/components/features/dashboard/widgets/recent-transactions";
import { StoreRanking } from "@/components/features/dashboard/widgets/store-ranking";
import type {
  SelectBudget,
  SelectCategory,
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
};

export function DashboardWidgets({
  recentTransactions,
  storeRanking,
  budgets,
  categoryExpenses,
  totalExpense,
  currentMonth,
}: DashboardWidgetsProps) {
  return (
    <>
      {/* Budget progress */}
      <BudgetProgress
        budgets={budgets}
        totalExpense={totalExpense}
        categoryExpenses={categoryExpenses}
      />

      {/* Widget area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StoreRanking data={storeRanking} />
        <RecentTransactions
          transactions={recentTransactions}
          currentMonth={currentMonth}
        />
      </div>
    </>
  );
}
