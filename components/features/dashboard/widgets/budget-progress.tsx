"use client";

import { AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { BudgetRing } from "@/components/features/dashboard/widgets/budget-ring";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SelectBudget, SelectCategory } from "@/db/schema";

interface BudgetWithCategory extends SelectBudget {
  category: SelectCategory | null;
}

interface BudgetProgressProps {
  budgets: BudgetWithCategory[];
  totalExpense: number;
  categoryExpenses: { categoryId: string; amount: number }[];
}

type ThresholdLevel = "safe" | "warning" | "danger" | "exceeded";

function getThresholdLevel(percentage: number): ThresholdLevel {
  if (percentage >= 100) return "exceeded";
  if (percentage >= 80) return "danger";
  if (percentage >= 50) return "warning";
  return "safe";
}

function getThresholdColor(level: ThresholdLevel) {
  switch (level) {
    case "exceeded":
      return {
        bar: "bg-red-500",
        badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        text: "text-red-600",
      };
    case "danger":
      return {
        bar: "bg-orange-500",
        badge:
          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        text: "text-orange-600",
      };
    case "warning":
      return {
        bar: "bg-yellow-500",
        badge:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        text: "text-yellow-600",
      };
    default:
      return {
        bar: "bg-emerald-500",
        badge:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        text: "text-emerald-600",
      };
  }
}

function ThresholdBadge({ percentage }: { percentage: number }) {
  const level = getThresholdLevel(percentage);
  if (level === "safe") return null;

  const colors = getThresholdColor(level);
  const label =
    level === "exceeded" ? "超過" : level === "danger" ? "注意" : "50%超";

  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 ${colors.badge}`}
    >
      {label}
    </Badge>
  );
}

function ProgressBar({
  label,
  spent,
  limit,
}: {
  label: string;
  spent: number;
  limit: number;
}) {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const clampedPercentage = Math.min(percentage, 100);
  const level = getThresholdLevel(percentage);
  const colors = getThresholdColor(level);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">{label}</span>
          <ThresholdBadge percentage={percentage} />
        </div>
        <span className="text-muted-foreground tabular-nums">
          ¥{spent.toLocaleString()} / ¥{limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${colors.bar} rounded-full transition-all animate-progress-fill`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-right">
        {percentage >= 100
          ? `¥${(spent - limit).toLocaleString()} オーバー`
          : `残り ¥${(limit - spent).toLocaleString()}`}
      </p>
    </div>
  );
}

type BudgetAlert = {
  label: string;
  percentage: number;
  level: ThresholdLevel;
  spent: number;
  limit: number;
};

function BudgetAlertBanner({ alerts }: { alerts: BudgetAlert[] }) {
  const exceededAlerts = alerts.filter((a) => a.level === "exceeded");
  const dangerAlerts = alerts.filter((a) => a.level === "danger");

  if (exceededAlerts.length === 0 && dangerAlerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {exceededAlerts.length > 0 && (
        <Alert
          variant="destructive"
          className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>予算超過</AlertTitle>
          <AlertDescription>
            {exceededAlerts.map((a) => a.label).join("、")}
            の予算を超過しています。
          </AlertDescription>
        </Alert>
      )}
      {dangerAlerts.length > 0 && (
        <Alert
          variant="default"
          className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
        >
          <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertTitle className="text-orange-800 dark:text-orange-300">
            予算に近づいています
          </AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-400">
            {dangerAlerts
              .map((a) => `${a.label}（${Math.round(a.percentage)}%）`)
              .join("、")}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export function BudgetProgress({
  budgets,
  totalExpense,
  categoryExpenses,
}: BudgetProgressProps) {
  const toastFired = useRef(false);

  const overallBudget = budgets.find((b) => !b.categoryId);
  const categoryBudgets = budgets.filter((b) => b.categoryId);

  // Collect alerts
  const alerts = useMemo(() => {
    const result: BudgetAlert[] = [];

    if (overallBudget) {
      const percentage = (totalExpense / overallBudget.amount) * 100;
      const level = getThresholdLevel(percentage);
      if (level !== "safe") {
        result.push({
          label: "全体予算",
          percentage,
          level,
          spent: totalExpense,
          limit: overallBudget.amount,
        });
      }
    }

    for (const b of categoryBudgets) {
      const catExpense =
        categoryExpenses.find((e) => e.categoryId === b.categoryId)?.amount ??
        0;
      const percentage = (catExpense / b.amount) * 100;
      const level = getThresholdLevel(percentage);
      if (level !== "safe") {
        result.push({
          label: b.category?.name ?? "不明",
          percentage,
          level,
          spent: catExpense,
          limit: b.amount,
        });
      }
    }

    return result;
  }, [overallBudget, categoryBudgets, categoryExpenses, totalExpense]);

  // Toast notification (once per session per alert set)
  useEffect(() => {
    if (toastFired.current || alerts.length === 0) return;

    const key = `budget-alert-${alerts.map((a) => `${a.label}-${a.level}`).join(",")}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(key)) return;

    const exceeded = alerts.filter((a) => a.level === "exceeded");
    const danger = alerts.filter((a) => a.level === "danger");

    if (exceeded.length > 0) {
      toast.error("予算超過", {
        description: `${exceeded.map((a) => a.label).join("、")}の予算を超過しています`,
      });
    } else if (danger.length > 0) {
      toast.warning("予算に注意", {
        description: `${danger.map((a) => a.label).join("、")}が80%を超えています`,
      });
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(key, "1");
    }
    toastFired.current = true;
  }, [alerts]);

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📊 予算進捗</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-muted-foreground text-center">
            まだ予算が設定されていません
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">設定から予算を追加</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <BudgetAlertBanner alerts={alerts} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📊 予算進捗</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Budget with Ring */}
          {overallBudget && (
            <div className="flex items-center gap-6">
              <BudgetRing spent={totalExpense} limit={overallBudget.amount} />
              <div className="flex-1">
                <ProgressBar
                  label="全体予算"
                  spent={totalExpense}
                  limit={overallBudget.amount}
                />
              </div>
            </div>
          )}

          {/* Category Budgets */}
          {categoryBudgets.map((b) => {
            const catExpense =
              categoryExpenses.find((e) => e.categoryId === b.categoryId)
                ?.amount ?? 0;
            return (
              <ProgressBar
                key={b.id}
                label={b.category?.name ?? "不明"}
                spent={catExpense}
                limit={b.amount}
              />
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
