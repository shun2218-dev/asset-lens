"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { CategoryTrendItem } from "@/app/actions/analysis/get-category-trends";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryTrendsProps {
  trends: CategoryTrendItem[];
}

/**
 * Shows per-category expense trends with sparkline charts
 * and month-over-month change badges.
 */
export function CategoryTrends({ trends }: CategoryTrendsProps) {
  if (trends.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">📈 カテゴリ別トレンド</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trends.slice(0, 6).map((trend) => (
          <div key={trend.categoryId} className="flex items-center gap-3">
            {/* Category name + amount */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">
                  {trend.categoryName}
                </span>
                <span className="text-sm tabular-nums text-muted-foreground ml-2">
                  ¥{trend.currentAmount.toLocaleString()}
                </span>
              </div>
              {/* Change badge */}
              {trend.changePercent !== null && (
                <div className="flex items-center gap-1 mt-0.5">
                  {trend.changePercent >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-red-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-emerald-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      trend.changePercent >= 0
                        ? "text-red-500"
                        : "text-emerald-500"
                    }`}
                  >
                    {trend.changePercent >= 0 ? "+" : ""}
                    {trend.changePercent.toFixed(0)}%
                  </span>
                </div>
              )}
            </div>

            {/* Sparkline */}
            <div className="w-20 h-8 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend.months}>
                  <defs>
                    <linearGradient
                      id={`gradient-${trend.categoryId}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={1.5}
                    fill={`url(#gradient-${trend.categoryId})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
