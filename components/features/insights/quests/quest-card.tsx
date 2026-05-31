import { differenceInCalendarDays, parseISO } from "date-fns";
import { CheckCircle2, Store, Tag, Target } from "lucide-react";
import type { Quest } from "@/app/actions/analysis/get-dynamic-quests";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  quest: Quest;
}

const STATUS_CLASSES: Record<
  Quest["status"],
  { bar: string; badge: string; ring: string; label: string }
> = {
  on_track: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    ring: "ring-emerald-200 dark:ring-emerald-900",
    label: "順調",
  },
  warning: {
    bar: "bg-orange-500",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    ring: "ring-orange-200 dark:ring-orange-900",
    label: "注意",
  },
  failed: {
    bar: "bg-red-500",
    badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    ring: "ring-red-200 dark:ring-red-900",
    label: "オーバー",
  },
  completed: {
    bar: "bg-emerald-500",
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    ring: "ring-emerald-200 dark:ring-emerald-900",
    label: "達成",
  },
};

export function QuestCard({ quest }: QuestCardProps) {
  const status = STATUS_CLASSES[quest.status];
  const TargetIcon = quest.targetKind === "store" ? Store : Tag;
  const cadenceLabel = quest.cadence === "weekly" ? "今週" : "今月";

  // Days remaining is computed once, server-side at render time. Acceptable
  // staleness because the page is re-fetched on every transaction mutation.
  const today = new Date();
  const daysRemaining = Math.max(
    0,
    differenceInCalendarDays(parseISO(quest.periodEnd), today),
  );

  const titleVerb = quest.cadence === "weekly" ? "今週" : "今月";
  const title = `${quest.targetLabel}を${titleVerb}¥${quest.thresholdJpy.toLocaleString("ja-JP")}以下に`;

  // Display percent — capped at 100 visually, even when over.
  const displayPct = Math.min(100, quest.progressPct);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1">
            <Target className="h-3 w-3" />
            {cadenceLabel}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <TargetIcon className="h-3 w-3" />
            {quest.targetKind === "store" ? "店舗" : "カテゴリ"}
          </Badge>
          <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium", status.badge)}>
            {quest.status === "completed" ? (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> {status.label}
              </span>
            ) : (
              status.label
            )}
          </span>
        </div>
        <p className="text-sm font-semibold leading-snug pt-1">{title}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div
          className="h-2.5 bg-muted rounded-full overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={displayPct}
          aria-label={`${quest.targetLabel}の進捗`}
        >
          <div
            className={cn(
              "h-full rounded-full motion-safe:transition-all",
              status.bar,
            )}
            style={{ width: `${displayPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="tabular-nums text-muted-foreground">
            ¥{quest.spentJpy.toLocaleString("ja-JP")} / ¥
            {quest.thresholdJpy.toLocaleString("ja-JP")}
          </span>
          <span className="tabular-nums text-muted-foreground">
            {quest.status === "completed"
              ? "期間終了"
              : `${daysRemaining}日残り`}
          </span>
        </div>
        {quest.progressPct > 100 && quest.status !== "completed" && (
          <p className="text-[11px] text-red-600 dark:text-red-400">
            目標を ¥
            {(quest.spentJpy - quest.thresholdJpy).toLocaleString("ja-JP")}
            超過しています
          </p>
        )}
      </CardContent>
    </Card>
  );
}
