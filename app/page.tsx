import { format } from "date-fns";
import { desc } from "drizzle-orm";
import { CategoryPie } from "@/components/charts/category-pie";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { TransactionForm } from "@/components/transaction-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { getCurrentMonthCategoryStats, getMonthlyStats } from "@/lib/analytics";

// メインページはサーバーコンポーネントです
export default async function Home() {
  // 全データを取得（実運用ではlimitやwhereで期間を絞るのが良いが、個人利用・初期段階なら全件でOK）
  const allTransactions = await db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.date));

  // 集計データの作成
  const monthlyStats = getMonthlyStats(allTransactions);
  const categoryStats = getCurrentMonthCategoryStats(allTransactions);

  return (
    <main className="container mx-auto p-4 max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AssetLens</h1>
      </div>

      {/* ダッシュボードエリア */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>月次収支推移</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={monthlyStats} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今月の支出内訳</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPie data={categoryStats} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左側: 入力フォーム (1カラム) */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>新規入力</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionForm />
            </CardContent>
          </Card>
        </div>

        {/* 右側: 履歴リスト (2カラム) */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>直近の履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>内容</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTransactions.slice(0, 10).map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{format(t.date, "MM/dd")}</TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell>{t.category}</TableCell>
                      <TableCell
                        className={`text-right ${t.isExpense ? "text-red-500" : "text-green-500"}`}
                      >
                        {t.isExpense ? "-" : "+"}¥{t.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {allTransactions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        データがありません
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
