"use client";

import { useState } from "react";
import type { DailyExpense } from "@/app/actions/analysis/get-daily-expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpenseHeatmapProps {
  dailyExpenses: DailyExpense[];
  currentMonth: string; // "yyyy-MM"
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * GitHub-grass-style heatmap calendar showing daily spending intensity.
 * Color intensity scales with the amount spent that day.
 */
export function ExpenseHeatmap({
  dailyExpenses,
  currentMonth,
}: ExpenseHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    amount: number;
    x: number;
    y: number;
  } | null>(null);

  const [year, month] = currentMonth.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0=Sunday

  // Build expense lookup
  const expenseMap = new Map(dailyExpenses.map((d) => [d.date, d.amount]));

  // Calculate intensity levels (5 levels)
  const amounts = dailyExpenses.map((d) => d.amount).filter((a) => a > 0);
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 1;

  const getIntensity = (amount: number): number => {
    if (amount === 0) return 0;
    const ratio = amount / maxAmount;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  const intensityColors = [
    "bg-muted/50", // 0: no spending
    "bg-emerald-200 dark:bg-emerald-900", // 1: light
    "bg-emerald-400 dark:bg-emerald-700", // 2: medium
    "bg-emerald-700 dark:bg-emerald-500", // 3: heavy
    "bg-emerald-800 dark:bg-emerald-300", // 4: max
  ];

  // Build grid: 7 columns (Sun-Sat) x ceil((startDayOfWeek + daysInMonth) / 7) rows
  const totalCells = startDayOfWeek + daysInMonth;
  const rows = Math.ceil(totalCells / 7);

  const cells: { day: number | null; dateStr: string; amount: number }[][] = [];
  for (let row = 0; row < rows; row++) {
    const rowCells: { day: number | null; dateStr: string; amount: number }[] =
      [];
    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col;
      const dayNum = cellIndex - startDayOfWeek + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        rowCells.push({ day: null, dateStr: "", amount: 0 });
      } else {
        const dateStr = `${currentMonth}-${String(dayNum).padStart(2, "0")}`;
        const amount = expenseMap.get(dateStr) || 0;
        rowCells.push({ day: dayNum, dateStr, amount });
      }
    }
    cells.push(rowCells);
  }

  const cellSize = 32;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">🗓 支出ヒートマップ</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Weekday headers */}
        <div
          className="grid gap-[3px] mb-1"
          style={{ gridTemplateColumns: `repeat(7, ${cellSize}px)` }}
        >
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-[10px] text-center text-muted-foreground font-medium"
              style={{ width: cellSize }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="relative">
          {cells.map((row, ri) => (
            <div
              key={`row-${ri}-${row.map((c) => c.day).join(",")}`}
              className="grid gap-[3px] mb-[3px]"
              style={{ gridTemplateColumns: `repeat(7, ${cellSize}px)` }}
            >
              {row.map((cell) => {
                if (cell.day === null) {
                  return (
                    <div
                      key={`empty-${ri}-${cell.dateStr || Math.random()}`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                      }}
                    />
                  );
                }

                const intensity = getIntensity(cell.amount);

                return (
                  // biome-ignore lint/a11y/noStaticElementInteractions: tooltip-only hover, not interactive
                  <div
                    key={cell.dateStr}
                    className={`rounded-sm cursor-default flex items-center justify-center text-[10px] transition-transform hover:scale-110 ${intensityColors[intensity]}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredDay({
                        date: cell.dateStr,
                        amount: cell.amount,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <span
                      className={`${intensity >= 3 ? "text-white" : "text-foreground/70"}`}
                    >
                      {cell.day}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Tooltip */}
          {hoveredDay && (
            <div
              className="fixed z-50 bg-popover text-popover-foreground border rounded-md px-2.5 py-1.5 text-xs shadow-md pointer-events-none"
              style={{
                left: hoveredDay.x,
                top: hoveredDay.y - 40,
                transform: "translateX(-50%)",
              }}
            >
              <span className="font-medium">
                {hoveredDay.date.split("-").slice(1).join("/")}
              </span>
              {" — "}
              <span className="tabular-nums">
                ¥{hoveredDay.amount.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[10px] text-muted-foreground">少</span>
          {intensityColors.map((color) => (
            <div
              key={`legend-${color}`}
              className={`w-3 h-3 rounded-sm ${color}`}
            />
          ))}
          <span className="text-[10px] text-muted-foreground">多</span>
        </div>
      </CardContent>
    </Card>
  );
}
