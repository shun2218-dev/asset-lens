"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createSubscription } from "@/app/actions/subscription/create";
import {
  type SubscriptionFormValues,
  subscriptionSchema,
} from "@/lib/validators";

export function useSubscriptionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: "",
      amount: 0,
      billingCycle: "monthly",
      category: "subscription",
    },
  });

  async function onSubmit(data: SubscriptionFormValues) {
    setIsPending(true);
    try {
      const result = await createSubscription(data);
      if (result.success) {
        toast.success("サブスクリプションを追加しました");
        form.reset();
        onSuccess?.();
      } else {
        toast.error(result.error || "エラーが発生しました");
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
    onSubmit: form.handleSubmit(onSubmit),
  };
}
