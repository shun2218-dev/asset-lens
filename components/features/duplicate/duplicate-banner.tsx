"use client";

import { AlertTriangle, Check, X } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  type DuplicateCandidate,
  dismissDuplicate,
  mergeDuplicates,
} from "@/app/actions/duplicate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DuplicateBannerProps {
  initialDuplicates: DuplicateCandidate[];
}

export function DuplicateBanner({ initialDuplicates }: DuplicateBannerProps) {
  const [duplicates, setDuplicates] =
    useState<DuplicateCandidate[]>(initialDuplicates);
  const [isPending, startTransition] = useTransition();

  const handleMerge = useCallback(
    (keepId: string, deleteId: string, index: number) => {
      startTransition(async () => {
        const result = await mergeDuplicates({ keepId, deleteId });
        if (result.success) {
          setDuplicates((prev) => prev.filter((_, i) => i !== index));
          toast.success("取引をマージしました");
        } else {
          toast.error("マージに失敗しました");
        }
      });
    },
    [],
  );

  const handleDismiss = useCallback(
    (transactionId1: string, transactionId2: string, index: number) => {
      startTransition(async () => {
        const result = await dismissDuplicate({
          transactionId1,
          transactionId2,
        });
        if (result.success) {
          setDuplicates((prev) => prev.filter((_, i) => i !== index));
          toast.success("重複候補を除外しました");
        } else {
          toast.error("除外に失敗しました");
        }
      });
    },
    [],
  );

  if (duplicates.length === 0) return null;

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("ja-JP", {
      month: "short",
      day: "numeric",
    }).format(date);

  return (
    <Card className="border-amber-500/50 bg-amber-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-base">重複の可能性がある取引</CardTitle>
          <Badge variant="secondary" className="ml-auto">
            {duplicates.length}件
          </Badge>
        </div>
        <CardDescription>
          同じ金額・日付・店舗の取引が見つかりました。マージまたは除外してください。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {duplicates.map((dup, index) => (
          <div
            key={`${dup.transaction1.id}-${dup.transaction2.id}`}
            className="flex flex-col gap-2 rounded-lg border p-3 bg-background"
          >
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <p className="font-medium">
                  {dup.transaction1.description ||
                    dup.transaction1.storeName ||
                    "—"}
                </p>
                <p className="text-muted-foreground">
                  {formatDate(dup.transaction1.date)} ·{" "}
                  {formatAmount(dup.transaction1.amount)}
                </p>
                {dup.transaction1.storeName && (
                  <p className="text-xs text-muted-foreground">
                    🏪 {dup.transaction1.storeName}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="font-medium">
                  {dup.transaction2.description ||
                    dup.transaction2.storeName ||
                    "—"}
                </p>
                <p className="text-muted-foreground">
                  {formatDate(dup.transaction2.date)} ·{" "}
                  {formatAmount(dup.transaction2.amount)}
                </p>
                {dup.transaction2.storeName && (
                  <p className="text-xs text-muted-foreground">
                    🏪 {dup.transaction2.storeName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() =>
                  handleDismiss(dup.transaction1.id, dup.transaction2.id, index)
                }
              >
                <X className="mr-1 h-3 w-3" />
                除外
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() =>
                  handleMerge(dup.transaction1.id, dup.transaction2.id, index)
                }
              >
                <Check className="mr-1 h-3 w-3" />
                左を残す
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() =>
                  handleMerge(dup.transaction2.id, dup.transaction1.id, index)
                }
              >
                <Check className="mr-1 h-3 w-3" />
                右を残す
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
