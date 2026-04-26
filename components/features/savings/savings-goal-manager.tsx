"use client";

import { PiggyBank, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { createSavingsGoal } from "@/app/actions/savings-goal/create";
import { deleteSavingsGoal } from "@/app/actions/savings-goal/delete";
import { depositToGoal } from "@/app/actions/savings-goal/deposit";
import { updateSavingsGoal } from "@/app/actions/savings-goal/update";
import { GoalCelebration } from "@/components/features/savings/goal-celebration";
import { SavingsGoalCard } from "@/components/features/savings/savings-goal-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SelectSavingsGoal } from "@/db/schema";

const ICON_OPTIONS = [
  { value: "piggy-bank", label: "🐷" },
  { value: "plane", label: "✈️" },
  { value: "car", label: "🚗" },
  { value: "home", label: "🏠" },
  { value: "heart", label: "❤️" },
  { value: "shield", label: "🛡️" },
  { value: "gift", label: "🎁" },
  { value: "graduation-cap", label: "🎓" },
];

const COLOR_OPTIONS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
];

interface SavingsGoalManagerProps {
  initialGoals: SelectSavingsGoal[];
}

export function SavingsGoalManager({ initialGoals }: SavingsGoalManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [goals, setGoals] = useState(initialGoals);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [celebrationGoal, setCelebrationGoal] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [icon, setIcon] = useState("piggy-bank");
  const [color, setColor] = useState("#6366f1");
  const [depositAmount, setDepositAmount] = useState("");

  const resetForm = () => {
    setName("");
    setTargetAmount("");
    setDeadline("");
    setIcon("piggy-bank");
    setColor("#6366f1");
  };

  const handleCreate = () => {
    if (!name.trim() || !targetAmount) return;

    startTransition(async () => {
      const result = await createSavingsGoal({
        name: name.trim(),
        targetAmount: Number.parseInt(targetAmount, 10),
        deadline: deadline ? new Date(deadline) : undefined,
        icon,
        color,
      });

      if (result.success) {
        toast.success("目標を作成しました");
        setShowCreateDialog(false);
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = (goalId: string) => {
    startTransition(async () => {
      const result = await deleteSavingsGoal(goalId);
      if (result.success) {
        setGoals((prev) => prev.filter((g) => g.id !== goalId));
        toast.success("目標を削除しました");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDeposit = useCallback((goalId: string) => {
    setDepositGoalId(goalId);
    setDepositAmount("");
    setShowDepositDialog(true);
  }, []);

  const handleDepositSubmit = () => {
    if (!depositGoalId || !depositAmount) return;

    startTransition(async () => {
      const result = await depositToGoal({
        goalId: depositGoalId,
        amount: Number.parseInt(depositAmount, 10),
      });

      if (result.success) {
        const goalName = goals.find((g) => g.id === depositGoalId)?.name ?? "";
        setShowDepositDialog(false);

        if (result.data.completed) {
          setCelebrationGoal(goalName);
        } else {
          toast.success(
            `¥${Number.parseInt(depositAmount, 10).toLocaleString()} を入金しました`,
          );
        }
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleStatusToggle = (goal: SelectSavingsGoal) => {
    const newStatus = goal.status === "completed" ? "active" : "completed";
    startTransition(async () => {
      const result = await updateSavingsGoal({
        id: goal.id,
        status: newStatus,
      });
      if (result.success) {
        router.refresh();
      }
    });
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <>
      <GoalCelebration
        show={!!celebrationGoal}
        goalName={celebrationGoal ?? ""}
        onComplete={() => setCelebrationGoal(null)}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">貯蓄目標</h2>
            <p className="text-sm text-muted-foreground">
              目標を設定して貯蓄の進捗を管理しましょう
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="sm"
            id="create-savings-goal-btn"
          >
            <Plus className="h-4 w-4 mr-1" />
            新しい目標
          </Button>
        </div>

        {activeGoals.length === 0 && completedGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <PiggyBank className="h-12 w-12 text-muted-foreground/40" />
            <div>
              <h3 className="font-semibold">目標がありません</h3>
              <p className="text-sm text-muted-foreground mt-1">
                貯蓄目標を作成して、お金を計画的に貯めましょう
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCreateDialog(true)}
            >
              目標を作成
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="group relative">
                <SavingsGoalCard goal={goal} onDeposit={handleDeposit} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleDelete(goal.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label={`${goal.name}を削除`}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {completedGoals.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-muted-foreground pt-2">
                  達成済み
                </h3>
                {completedGoals.map((goal) => (
                  <div key={goal.id} className="group relative">
                    <SavingsGoalCard goal={goal} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(goal)}
                        className="p-1.5 rounded-md text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        disabled={isPending}
                      >
                        再開
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(goal.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label={`${goal.name}を削除`}
                        disabled={isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しい貯蓄目標</DialogTitle>
            <DialogDescription>貯蓄の目標を設定しましょう</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-name">目標名</Label>
              <Input
                id="goal-name"
                placeholder="旅行資金"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="goal-amount">目標金額</Label>
              <Input
                id="goal-amount"
                type="number"
                placeholder="500000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="goal-deadline">期限（任意）</Label>
              <Input
                id="goal-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div>
              <Label>アイコン</Label>
              <div className="flex gap-2 mt-1">
                {ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIcon(opt.value)}
                    className={`p-2 rounded-lg text-lg transition-all ${
                      icon === opt.value
                        ? "bg-primary/10 ring-2 ring-primary scale-110"
                        : "hover:bg-muted"
                    }`}
                    aria-label={opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>カラー</Label>
              <div className="flex gap-2 mt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === c
                        ? "ring-2 ring-offset-2 ring-primary scale-110"
                        : ""
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={isPending || !name.trim() || !targetAmount}
              className="w-full"
            >
              作成
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deposit dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>入金</DialogTitle>
            <DialogDescription>
              目標への入金額を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="deposit-amount">入金額（円）</Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="10000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <Button
              onClick={handleDepositSubmit}
              disabled={isPending || !depositAmount}
              className="w-full"
            >
              入金する
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
