import { CalendarDays, CalendarRange, Trophy } from "lucide-react";
import type { DynamicQuestsResult } from "@/app/actions/analysis/get-dynamic-quests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestCard } from "./quest-card";
import { QuestEmptyState } from "./quest-empty-state";

interface QuestListProps {
  data: DynamicQuestsResult;
}

export function QuestList({ data }: QuestListProps) {
  if (data.insufficientHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-primary" />
            クエスト
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuestEmptyState />
        </CardContent>
      </Card>
    );
  }

  const allCompleted =
    data.weekly.length + data.monthly.length > 0 &&
    [...data.weekly, ...data.monthly].every(
      (q) => q.status === "completed" || q.progressPct < 70,
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-5 w-5 text-primary" />
          クエスト
          {allCompleted && (
            <span className="ml-auto text-xs font-normal text-emerald-600 dark:text-emerald-400">
              🎉 順調なペースです！
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Section
          icon={<CalendarRange className="h-4 w-4 text-muted-foreground" />}
          title="今週のクエスト"
          quests={data.weekly}
          emptyHint="先月、ベスト3に入る店舗がありませんでした。"
        />
        <Section
          icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
          title="今月のクエスト"
          quests={data.monthly}
          emptyHint="先月のカテゴリ別支出が不足しています。"
        />
      </CardContent>
    </Card>
  );
}

function Section({
  icon,
  title,
  quests,
  emptyHint,
}: {
  icon: React.ReactNode;
  title: string;
  quests: DynamicQuestsResult["weekly"];
  emptyHint: string;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        <span className="uppercase tracking-wide">{title}</span>
      </div>
      {quests.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyHint}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      )}
    </section>
  );
}
