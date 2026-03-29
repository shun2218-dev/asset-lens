"use client";

import { format } from "date-fns";
import { CreditCard, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteSubscription } from "@/app/actions/subscription/delete";
import { SubscriptionForm } from "@/components/features/subscription/subscription-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SelectSubscription } from "@/db/schema";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";

interface SubscriptionListProps {
  subscriptions: SelectSubscription[];
}

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  const router = useRouter();
  const [editTarget, setEditTarget] = useState<SelectSubscription | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteSubscription(id);
      if (result.success) {
        toast.success("サブスクリプションを削除しました");
        router.refresh();
      } else {
        toast.error(result.error || "削除に失敗しました");
      }
    });
  };

  const handleEditSuccess = () => {
    setEditTarget(null);
    router.refresh();
  };

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7">
      {/* 左側: 登録/編集フォーム */}
      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {editTarget ? "編集" : "新規登録"}
            </CardTitle>
            <CardDescription>
              {editTarget
                ? `「${editTarget.name}」を編集中`
                : "定期支払いのサービスを登録します"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionForm
              key={editTarget?.id ?? "new"}
              editTarget={editTarget}
              onSuccess={handleEditSuccess}
              onCancel={editTarget ? () => setEditTarget(null) : undefined}
            />
          </CardContent>
        </Card>
      </div>

      {/* 右側: 一覧リスト */}
      <div className="lg:col-span-4">
        <Card className="h-full border-dashed lg:border-solid">
          <CardHeader>
            <CardTitle>登録済みリスト</CardTitle>
            <CardDescription>登録中のサブスクリプション一覧</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <CreditCard className="h-10 w-10 mb-2 opacity-20" />
                <p>登録されているサブスクリプションはありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className={`flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm transition-colors ${
                      editTarget?.id === sub.id ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">
                          {sub.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 h-5 shrink-0"
                        >
                          {sub.billingCycle === "monthly" ? "月額" : "年額"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex gap-2">
                        <span>
                          次回: {format(sub.nextPaymentDate, "yyyy/MM/dd")}
                        </span>
                        <span className="text-muted-foreground/50">|</span>
                        <span>
                          {EXPENSE_CATEGORY_LABELS[sub.category] ??
                            sub.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className="font-bold text-lg">
                        ¥{sub.amount.toLocaleString()}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditTarget(sub)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              サブスクリプションの削除
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              「{sub.name}」を削除しますか？
                              この操作は取り消せません。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(sub.id)}
                              disabled={isPending}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              削除する
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
