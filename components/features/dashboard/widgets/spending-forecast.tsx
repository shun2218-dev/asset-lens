"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import type { ForecastResult } from "@/app/actions/analysis/get-spending-forecast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_CONFIG = {
  on_track: {
    label: "順調",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: TrendingDown,
    barColor: "bg-emerald-500",
  },
  warning: {
    label: "注意",
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    icon: TrendingUp,
    barColor: "bg-orange-500",
  },
  over_budget: {
    label: "超過見込み",
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    icon: TrendingUp,
    barColor: "bg-red-500",
  },
  insufficient_data: {
    label: "データ不足",
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border",
    icon: TrendingUp,
    barColor: "bg-muted-foreground/30",
  },
} as const;

interface SpendingForecastProps {
  forecast: ForecastResult;
}

export function SpendingForecast({ forecast }: SpendingForecastProps) {
  const config = STATUS_CONFIG[forecast.status];
  const Icon = config.icon;

  const target = forecast.budgetAmount ?? forecast.historicalAverage;
  const progressPercent =
    target > 0 ? Math.min((forecast.currentSpend / target) * 100, 100) : 0;
  const projectedPercent =
    target > 0 ? Math.min((forecast.projectedSpend / target) * 100, 100) : 0;

  return (
    <Card className={`${config.border}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>📈 支出予測</span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}
          >
            <Icon className="inline h-3 w-3 mr-0.5" />
            {config.label}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {forecast.status === "insufficient_data" ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            予測には{7}日以上のデータが必要です（現在{forecast.daysElapsed}
            日分）
          </p>
        ) : (
          <>
            {/* Projected spending */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">月末予測</span>
                <span className={`font-bold tabular-nums ${config.color}`}>
                  ¥{forecast.projectedSpend.toLocaleString()}
                </span>
              </div>
              {target > 0 && (
                <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                  {/* Projected (lighter) */}
                  <div
                    className={`absolute h-full ${config.barColor} opacity-30 rounded-full transition-all`}
                    style={{ width: `${projectedPercent}%` }}
                  />
                  {/* Current (solid) */}
                  <div
                    className={`absolute h-full ${config.barColor} rounded-full transition-all animate-progress-fill`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">現在の支出</p>
                <p className="text-sm font-semibold tabular-nums">
                  ¥{forecast.currentSpend.toLocaleString()}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">日あたり</p>
                <p className="text-sm font-semibold tabular-nums">
                  ¥{forecast.dailyRate.toLocaleString()}/日
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">
                  {forecast.budgetAmount ? "予算" : "過去3ヶ月平均"}
                </p>
                <p className="text-sm font-semibold tabular-nums">
                  ¥{(target || 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">経過</p>
                <p className="text-sm font-semibold tabular-nums">
                  {forecast.daysElapsed}/{forecast.daysInMonth}日
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
