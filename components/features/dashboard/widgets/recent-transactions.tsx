"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SelectTransaction } from "@/db/schema";

interface RecentTransactionsProps {
  transactions: SelectTransaction[];
  currentMonth: string;
}

export function RecentTransactions({
  transactions,
  currentMonth,
}: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">📋 直近の取引</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            今月の取引データがありません
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-1.5 border-b last:border-b-0"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {tx.storeName || tx.description}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(tx.date, "M/d (E)", { locale: ja })}
                    {tx.storeName && tx.description !== "サブスク" && (
                      <> · {tx.description}</>
                    )}
                  </span>
                </div>
                <span
                  className={`text-sm font-medium tabular-nums whitespace-nowrap ${
                    tx.isExpense ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {tx.isExpense ? "-" : "+"}¥{tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
            <Link
              href={`/transaction?month=${currentMonth}`}
              className="block text-sm text-primary hover:underline text-center pt-2"
            >
              もっと見る →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
