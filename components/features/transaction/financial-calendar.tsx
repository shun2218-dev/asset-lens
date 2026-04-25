"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isSameDay,
  isSameMonth,
  parse,
  startOfMonth,
} from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  type DailySummary,
  getMonthlyDailySummary,
} from "@/app/actions/transaction/get-daily-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

interface FinancialCalendarProps {
  currentMonth: string; // "yyyy-MM"
  onDayClick?: (date: Date) => void;
  selectedDate?: Date | null;
}

export function FinancialCalendar({
  currentMonth,
  onDayClick,
  selectedDate,
}: FinancialCalendarProps) {
  const [dailyData, setDailyData] = useState<DailySummary[]>([]);
  const [isPending, startTransition] = useTransition();
  const [calendarMonth, setCalendarMonth] = useState(currentMonth);

  const monthDate = parse(calendarMonth, "yyyy-MM", new Date());
  const today = new Date();
  const isNextDisabled =
    isSameMonth(monthDate, today) || isAfter(monthDate, today);

  // Fetch daily summary when month changes
  useEffect(() => {
    startTransition(async () => {
      const result = await getMonthlyDailySummary(calendarMonth);
      if (result.success) {
        setDailyData(result.data);
      }
    });
  }, [calendarMonth]);

  const handleMonthChange = useCallback(
    (offset: number) => {
      const next = addMonths(monthDate, offset);
      setCalendarMonth(format(next, "yyyy-MM"));
    },
    [monthDate],
  );

  // Build lookup map: "yyyy-MM-dd" -> DailySummary
  const dataMap = useMemo(() => {
    const map = new Map<string, DailySummary>();
    for (const d of dailyData) {
      map.set(d.date, d);
    }
    return map;
  }, [dailyData]);

  // Calendar grid days
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0=Sun

  // Monthly totals
  const monthlyIncome = dailyData.reduce((sum, d) => sum + Number(d.income), 0);
  const monthlyExpense = dailyData.reduce(
    (sum, d) => sum + Number(d.expense),
    0,
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            カレンダー
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleMonthChange(-1)}
              aria-label="前月"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[80px] text-center">
              {format(monthDate, "yyyy年M月")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleMonthChange(1)}
              disabled={isNextDisabled}
              aria-label="翌月"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Monthly summary */}
        <div className="flex gap-4 text-xs mt-2">
          <span className="text-green-700 dark:text-green-400">
            収入: ¥{monthlyIncome.toLocaleString()}
          </span>
          <span className="text-red-700 dark:text-red-400">
            支出: ¥{monthlyExpense.toLocaleString()}
          </span>
          <span
            className={cn(
              "font-semibold",
              monthlyIncome - monthlyExpense >= 0
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400",
            )}
          >
            差引: ¥{(monthlyIncome - monthlyExpense).toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Weekday header */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={cn(
                "text-center text-xs font-medium py-1",
                i === 0 && "text-red-700 dark:text-red-400",
                i === 6 && "text-blue-700 dark:text-blue-400",
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div
          className={cn(
            "grid grid-cols-7 gap-px bg-border/50 rounded-lg overflow-hidden",
            isPending && "opacity-50",
          )}
        >
          {/* Empty cells for offset */}
          {WEEKDAYS.slice(0, startDayOfWeek).map((dayName) => (
            <div
              key={`empty-${dayName}`}
              className="bg-background min-h-[52px] sm:min-h-[64px]"
            />
          ))}

          {/* Day cells */}
          {daysInMonth.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const data = dataMap.get(dateKey);
            const isToday = isSameDay(day, today);
            const isSelected = selectedDate
              ? isSameDay(day, selectedDate)
              : false;
            const dayOfWeek = getDay(day);

            return (
              <button
                key={dateKey}
                type="button"
                className={cn(
                  "bg-background min-h-[52px] sm:min-h-[64px] p-1 text-left transition-colors",
                  "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isToday && "ring-1 ring-primary/50",
                  isSelected && "bg-primary/10 ring-2 ring-primary",
                )}
                onClick={() => onDayClick?.(day)}
                aria-label={format(day, "M月d日(E)", { locale: ja })}
              >
                <span
                  className={cn(
                    "text-xs font-medium block",
                    dayOfWeek === 0 && "text-red-700 dark:text-red-400",
                    dayOfWeek === 6 && "text-blue-700 dark:text-blue-400",
                    isToday &&
                      "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px]",
                  )}
                >
                  {format(day, "d")}
                </span>

                {data && (
                  <div className="mt-0.5 space-y-0">
                    {Number(data.income) > 0 && (
                      <p className="text-[9px] sm:text-[10px] text-green-700 dark:text-green-400 truncate leading-tight">
                        +{Number(data.income).toLocaleString()}
                      </p>
                    )}
                    {Number(data.expense) > 0 && (
                      <p className="text-[9px] sm:text-[10px] text-red-700 dark:text-red-400 truncate leading-tight">
                        -{Number(data.expense).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Dot indicator for days with transactions */}
                {data && !data.income && !data.expense && (
                  <div className="flex justify-center mt-1">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
