import { format } from "date-fns";
import type { Metadata } from "next";
import { getDynamicQuests } from "@/app/actions/analysis/get-dynamic-quests";
import { getMoneyFlow } from "@/app/actions/analysis/get-money-flow";
import { MoneyFlowCard } from "@/components/features/insights/money-flow/money-flow-card";
import { QuestList } from "@/components/features/insights/quests/quest-list";
import { MonthSelector } from "@/components/features/dashboard/month-selector";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "インサイト",
  description:
    "予算からカテゴリ・店舗・タグまでの資金フローを可視化し、先月の支出傾向から自動生成されるクエストで節約を後押しします。",
};

interface InsightsPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function InsightsPage({
  searchParams,
}: InsightsPageProps) {
  const params = await searchParams;
  const currentMonth = params.month || format(new Date(), "yyyy-MM");

  const [moneyFlowResult, questsResult] = await Promise.all([
    getMoneyFlow(currentMonth),
    getDynamicQuests(),
  ]);

  return (
    <main className="container mx-auto p-4 max-w-6xl space-y-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold">インサイト</h1>
        <MonthSelector currentMonth={currentMonth} />
      </div>

      {moneyFlowResult.success ? (
        <MoneyFlowCard data={moneyFlowResult.data} />
      ) : (
        <ErrorCard
          title="マネーフローを読み込めませんでした"
          message={moneyFlowResult.error}
        />
      )}

      {questsResult.success ? (
        <QuestList data={questsResult.data} />
      ) : (
        <ErrorCard
          title="クエストを読み込めませんでした"
          message={questsResult.error}
        />
      )}
    </main>
  );
}

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <Card>
      <CardContent className="py-8 text-center space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
