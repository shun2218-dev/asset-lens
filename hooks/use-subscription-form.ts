"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createSubscription } from "@/app/actions/subscription/create";
import { updateSubscription } from "@/app/actions/subscription/update";
import type { SelectSubscription } from "@/db/schema";
import {
  type SubscriptionFormValues,
  subscriptionSchema,
} from "@/lib/validators";

interface UseSubscriptionFormProps {
  onSuccess?: () => void;
  editTarget?: SelectSubscription | null;
}

export function useSubscriptionForm({
  onSuccess,
  editTarget,
}: UseSubscriptionFormProps = {}) {
  const [isPending, setIsPending] = useState(false);
  const isEditing = !!editTarget;

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: editTarget
      ? {
          name: editTarget.name,
          amount: editTarget.amount,
          billingCycle: editTarget.billingCycle as "monthly" | "yearly",
          nextPaymentDate: new Date(editTarget.nextPaymentDate),
          category: editTarget.category,
        }
      : {
          name: "",
          amount: 0,
          billingCycle: "monthly",
          category: "subscription",
        },
  });

  async function onSubmit(data: SubscriptionFormValues) {
    setIsPending(true);
    try {
      if (isEditing && editTarget) {
        const result = await updateSubscription(editTarget.id, data);
        if (result.success) {
          toast.success("サブスクリプションを更新しました");
          onSuccess?.();
        } else {
          toast.error(result.error || "エラーが発生しました");
        }
      } else {
        const result = await createSubscription(data);
        if (result.success) {
          toast.success("サブスクリプションを追加しました");
          form.reset();
          onSuccess?.();
        } else {
          toast.error(result.error || "エラーが発生しました");
        }
      }
    } catch {
      toast.error("通信エラーが発生しました");
    } finally {
      setIsPending(false);
    }
  }

  return {
    form,
    isPending,
    isEditing,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
