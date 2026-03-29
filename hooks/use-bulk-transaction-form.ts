"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createBulkTransaction } from "@/app/actions/transaction/create-bulk";
import type { BulkTransactionFormValues } from "@/lib/validators";
import { bulkTransactionSchema } from "@/lib/validators";

interface UseBulkTransactionFormProps {
  onSuccess?: () => void;
}

export function useBulkTransactionForm({
  onSuccess,
}: UseBulkTransactionFormProps = {}) {
  const form = useForm<BulkTransactionFormValues>({
    resolver: zodResolver(bulkTransactionSchema),
    defaultValues: {
      userId: "dummy-user-id",
      date: new Date(),
      entries: [
        {
          amount: 0,
          description: "",
          storeName: "",
          category: "",
          isExpense: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entries",
  });

  const addEntry = () => {
    append({
      amount: 0,
      description: "",
      storeName: "",
      category: "",
      isExpense: true,
    });
  };

  const removeEntry = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: BulkTransactionFormValues) => {
    try {
      const normalizedDate = new Date(
        Date.UTC(
          data.date.getFullYear(),
          data.date.getMonth(),
          data.date.getDate(),
        ),
      );

      const payload = { ...data, date: normalizedDate };

      const result = await createBulkTransaction(payload);
      if (result.success) {
        form.reset({
          userId: "dummy-user-id",
          date: new Date(),
          entries: [
            {
              amount: 0,
              description: "",
              storeName: "",
              category: "",
              isExpense: true,
            },
          ],
        });
        toast.success(`${data.entries.length}件を登録しました`);
        onSuccess?.();
      } else {
        toast.error(result.error || "一括登録に失敗しました");
      }
    } catch (error) {
      toast.error("予期せぬエラーが発生しました");
      console.error(error);
    }
  };

  return {
    form,
    fields,
    addEntry,
    removeEntry,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
    isValid: form.formState.isValid,
  };
}
