"use client";

import { addMonths, format, isAfter, isSameMonth, parse } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface MonthSelectorProps {
  currentMonth: string; // "yyyy-MM"
}

export function MonthSelector({ currentMonth }: MonthSelectorProps) {
  const router = useRouter();

  // 現在の年月（リアルタイム）を取得
  const today = new Date();
  const currentDate = parse(currentMonth, "yyyy-MM", new Date());

  const handleMove = (offset: number) => {
    // 1ヶ月足す/引く
    const nextDate = addMonths(currentDate, offset);
    const nextMonthStr = format(nextDate, "yyyy-MM");
    router.push(`/?month=${nextMonthStr}`);
  };

  // "未来" かどうかの判定（現在の月より後は選択させない）
  const isNextDisabled =
    isSameMonth(currentDate, today) || isAfter(currentDate, today);

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="icon" onClick={() => handleMove(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-lg font-bold min-w-25 text-center">
        {format(currentDate, "yyyy年M月")}
      </span>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handleMove(1)}
        disabled={isNextDisabled} // 現在の月なら「次へ」を無効化
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
