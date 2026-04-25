"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { RecurringPattern } from "@/app/actions/analysis/detect-recurring-patterns";
import { detectRecurringPatterns } from "@/app/actions/analysis/detect-recurring-patterns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecurringPatterns() {
  const [patterns, setPatterns] = useState<RecurringPattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await detectRecurringPatterns(undefined);
      if (result.success) {
        setPatterns(result.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">🔄 定期支出の検出</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (patterns.length === 0) return null;

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          定期支出の候補
          <Badge
            variant="secondary"
            className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {patterns.length}件
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          繰り返しの支出パターンが見つかりました。サブスクリプションとして登録すると管理が楽になります。
        </p>
        {patterns.slice(0, 5).map((p) => (
          <div
            key={`${p.storeName || p.description}-${p.category}`}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                {p.storeName || p.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {p.category} · {p.occurrences}ヶ月連続
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums">
              ¥{p.averageAmount.toLocaleString()}/月
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
