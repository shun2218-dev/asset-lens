"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { scanReceipt } from "@/app/actions/analysis/scan-receipt";
import { createTransaction } from "@/app/actions/transaction/create";
import { updateTransaction } from "@/app/actions/transaction/update";
import type { TransactionFormValues } from "@/lib/validators";
import { transactionSchema } from "@/lib/validators";
import type { TransactionResult } from "@/types";

interface UseTransactionFormProps {
  initialData?: {
    userId: string;
    amount: number;
    description: string;
    category: string;
    date: Date;
    isExpense: boolean;
  };
  id?: string;
  onSuccess?: () => void;
}

export function useTransactionForm({
  initialData,
  id,
  onSuccess,
}: UseTransactionFormProps) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          userId: "dummy-user-id",
          amount: 0,
          description: "",
          category: "",
          date: new Date(),
          isExpense: true,
        },
  });

  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vercel limits (4.5MB), safe limit 4MB
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

    if (file.size > MAX_FILE_SIZE) {
      toast.error("ファイルサイズが大きすぎます(上限4MB)", {
        description: "別の画像を選択するか、サイズを小さくしてください。",
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setIsScanning(true);
      toast.loading("レシートを解析中...", { id: "scan-toast" });

      const formData = new FormData();
      formData.append("file", file);

      const result = await scanReceipt(formData);

      toast.success("解析が完了しました", { id: "scan-toast" });

      if (result.amount)
        form.setValue("amount", result.amount, { shouldValidate: true });
      if (result.description)
        form.setValue("description", result.description, {
          shouldValidate: true,
        });
      if (result.category)
        form.setValue("category", result.category, { shouldValidate: true });
      if (result.date) {
        form.setValue("date", new Date(result.date), { shouldValidate: true });
      }
    } catch (error) {
      console.error(error);
      toast.error("読み取りに失敗しました", { id: "scan-toast" });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      const normalizedDate = new Date(
        Date.UTC(
          data.date.getFullYear(),
          data.date.getMonth(),
          data.date.getDate(),
        ),
      );

      const payload = { ...data, date: normalizedDate };

      let result: TransactionResult;
      if (id) {
        result = await updateTransaction(id, payload);
        if (result.success) {
          toast.success("更新しました");
          onSuccess?.();
        } else {
          toast.error("更新に失敗しました");
        }
      } else {
        result = await createTransaction(payload);
        if (result.success) {
          form.reset({
            userId: "dummy-user-id",
            amount: 0,
            description: "",
            category: "",
            date: new Date(),
            isExpense: true,
          });
          toast.success("登録しました");
        } else {
          toast.error("登録に失敗しました");
        }
      }
    } catch (error) {
      toast.error("予期せぬエラーが発生しました");
      console.error(error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    form,
    isScanning,
    fileInputRef,
    handleFileChange,
    triggerFileInput,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
    isValid: form.formState.isValid,
  };
}
