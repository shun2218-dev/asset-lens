"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StoreRankingItem {
  storeName: string;
  totalAmount: number;
}

interface StoreRankingProps {
  data: StoreRankingItem[];
}

export function StoreRanking({ data }: StoreRankingProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">🏪 店舗別ランキング</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            今月の支出データがありません
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxAmount = data[0]?.totalAmount ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">🏪 店舗別ランキング</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item, index) => (
          <div key={item.storeName} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground font-mono w-4">
                  {index + 1}.
                </span>
                <span className="font-medium truncate max-w-[140px]">
                  {item.storeName}
                </span>
              </span>
              <span className="text-muted-foreground tabular-nums">
                ¥{item.totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/70 rounded-full transition-all"
                style={{
                  width: `${(item.totalAmount / maxAmount) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
