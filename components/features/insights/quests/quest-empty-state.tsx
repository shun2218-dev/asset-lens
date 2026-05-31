import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function QuestEmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Trophy className="h-8 w-8 text-muted-foreground/60" />
        <p className="text-sm font-medium">クエストはまだありません</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          先月の支出データが揃うと、上位の店舗・カテゴリに合わせたクエストが自動生成されます。
        </p>
      </CardContent>
    </Card>
  );
}
