"use client";

import * as LucideIcons from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SelectSavingsGoal } from "@/db/schema";

interface SavingsGoalCardProps {
  goal: SelectSavingsGoal;
  onDeposit?: (goalId: string) => void;
}

/**
 * Individual savings goal card with circular progress ring,
 * goal details, and quick deposit button.
 */
export function SavingsGoalCard({ goal, onDeposit }: SavingsGoalCardProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const rafRef = useRef<number>(0);

  const rawPercent =
    goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const percent = Math.min(rawPercent, 100);
  const isCompleted = goal.status === "completed";

  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  // Days remaining calculation
  const daysRemaining = goal.deadline
    ? Math.max(
        0,
        Math.ceil(
          (new Date(goal.deadline).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  useEffect(() => {
    const duration = 800;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setAnimatedPercent(Math.round(eased * percent));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [percent]);

  const iconName = toPascalCase(goal.icon);
  const IconComponent =
    (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[
      iconName
    ] ?? LucideIcons.PiggyBank;

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${
        isCompleted
          ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Progress ring */}
        <div
          className="relative shrink-0"
          style={{ width: size, height: size }}
        >
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
            role="img"
            aria-label={`${goal.name} 達成率 ${Math.round(percent)}%`}
          >
            <title>{`${goal.name} 達成率 ${Math.round(percent)}%`}</title>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted/20"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={isCompleted ? "hsl(152, 69%, 41%)" : goal.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: isCompleted ? "hsl(152, 69%, 41%)" : goal.color }}
            >
              {animatedPercent}%
            </span>
          </div>
        </div>

        {/* Goal details */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <IconComponent
              className="h-4 w-4 shrink-0"
              style={{ color: goal.color }}
            />
            <h3 className="font-semibold text-sm truncate">{goal.name}</h3>
            {isCompleted && (
              <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-medium">
                達成!
              </span>
            )}
          </div>

          <div className="text-sm">
            <span className="font-semibold tabular-nums">
              ¥{goal.currentAmount.toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              {" "}
              / ¥{goal.targetAmount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {daysRemaining !== null && (
              <span
                className={
                  daysRemaining <= 7 ? "text-amber-600 dark:text-amber-400" : ""
                }
              >
                残り{daysRemaining}日
              </span>
            )}
            <span>
              残り ¥
              {Math.max(
                0,
                goal.targetAmount - goal.currentAmount,
              ).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quick deposit button */}
        {!isCompleted && onDeposit && (
          <button
            type="button"
            onClick={() => onDeposit(goal.id)}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: goal.color }}
            aria-label={`${goal.name}に入金`}
          >
            入金
          </button>
        )}
      </div>
    </div>
  );
}

function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
