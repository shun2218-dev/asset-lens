"use client";

import { ArrowRight, PiggyBank } from "lucide-react";
import Link from "next/link";
import { SavingsGoalCard } from "@/components/features/savings/savings-goal-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SelectSavingsGoal } from "@/db/schema";

interface SavingsGoalsWidgetProps {
  goals: SelectSavingsGoal[];
}

/**
 * Dashboard widget showing top 3 active savings goals.
 * Links to settings for full management.
 */
export function SavingsGoalsWidget({ goals }: SavingsGoalsWidgetProps) {
  const activeGoals = goals.filter((g) => g.status === "active").slice(0, 3);

  if (
    activeGoals.length === 0 &&
    goals.filter((g) => g.status === "completed").length === 0
  ) {
    return null;
  }

  const totalSaved = goals
    .filter((g) => g.status === "active")
    .reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <Card className="animate-fade-in-up stagger-5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <PiggyBank className="h-4 w-4 text-indigo-500" />
            貯蓄目標
          </CardTitle>
          <Link
            href="/settings?tab=savings"
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            すべて見る
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {totalSaved > 0 && (
          <p className="text-xs text-muted-foreground">
            合計貯蓄額: ¥{totalSaved.toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {activeGoals.map((goal) => (
          <SavingsGoalCard key={goal.id} goal={goal} />
        ))}
        {goals.filter((g) => g.status === "completed").length > 0 && (
          <p className="text-xs text-center text-emerald-600 dark:text-emerald-400 font-medium">
            🎉 {goals.filter((g) => g.status === "completed").length}
            件の目標を達成済み
          </p>
        )}
      </CardContent>
    </Card>
  );
}
