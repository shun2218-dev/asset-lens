"use client";

import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteTransaction } from "@/app/actions/delete-transaction";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionForm } from "./transaction-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface TransactionItemMenuProps {
  transaction: {
    id: string;
    userId: string;
    amount: number;
    description: string;
    category: string;
    date: Date;
    isExpense: boolean;
  };
}

export function TransactionItemMenu({ transaction }: TransactionItemMenuProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDelete = () => {
    // confirm は削除

    const toastId = toast.loading("削除しています...");

    startTransition(async () => {
      const result = await deleteTransaction(transaction.id);

      if (result.success) {
        toast.success("削除しました", { id: toastId });
        setShowDeleteDialog(false);
      } else {
        toast.error("削除に失敗しました", { id: toastId });
      }
    });
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">メニューを開く</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            編集
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。この家計簿データはサーバーから永久に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isPending}
            >
              {isPending ? "削除中..." : "削除する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>履歴の編集</DialogTitle>
            <DialogDescription>
              以下のフォームで内容を修正し、更新ボタンを押してください。
            </DialogDescription>
          </DialogHeader>

          {/* フォームを配置: initialData と id を渡す */}
          <TransactionForm
            id={transaction.id}
            initialData={{
              userId: transaction.userId,
              amount: transaction.amount, // 必要に応じて Math.abs(transaction.amount)
              description: transaction.description,
              category: transaction.category,
              date: transaction.date,
              isExpense: transaction.isExpense,
            }}
            onSuccess={() => setShowEditDialog(false)} // 成功したら閉じる
            onCancel={() => setShowEditDialog(false)} // キャンセルしたら閉じる
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
