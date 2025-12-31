import { CategoryPie } from "@/components/charts/category-pie";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { PaginationControl } from "@/components/pagination-control";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionItem } from "@/components/transaction-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSummary } from "./actions/get-summary";
import { getTransactions } from "./actions/get-transactions";

interface HomePageProps {
  searchParams: { page?: string };
}

export default async function Home({ searchParams }: HomePageProps) {
  const { page } = await searchParams;
  const currentPage = Number(page ?? 1);

  const [transactionsData, summaryData] = await Promise.all([
    getTransactions(currentPage), // リスト用 (10件)
    getSummary(), // グラフ・集計用 (全件集計)
  ]);

  const { data: transactions, metadata } = transactionsData;
  const { summary, categoryStats, monthlyStats } = summaryData;

  // 全データを取得（実運用ではlimitやwhereで期間を絞る）
  // const allTransactions = await db
  //   .select()
  //   .from(transactions)
  //   .orderBy(desc(transactions.date));

  // 集計データの作成
  // const monthlyStats = getMonthlyStats(transactions);
  // const categoryStats = getCurrentMonthCategoryStats(transactions);

  // グラフ用にデータを変換 (Adapter Pattern)
  // MonthlyChart: { month, income, expense } -> { name, income, expense }
  const barData = monthlyStats.map((stat) => ({
    name: stat.month, // "2024-01" などを name に入れる
    income: stat.income,
    expense: stat.expense,
  }));

  // CategoryPie: { category, amount } -> { name, value }
  const pieData = categoryStats.map((stat) => ({
    name: stat.category,
    value: stat.amount,
  }));

  return (
    <main className="container mx-auto p-4 max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AssetLens</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center p-4 bg-muted rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">収入</p>
          <p className="font-bold text-blue-600">
            +{summary.totalIncome.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">支出</p>
          <p className="font-bold text-red-600">
            -{summary.totalExpense.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">残高</p>
          <p className="font-bold">¥{summary.balance.toLocaleString()}</p>
        </div>
      </div>

      {/* ダッシュボードエリア */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>月次収支推移</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={barData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今月の支出内訳</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPie data={pieData} />
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
                  {transactions.slice(0, 10).map((t) => (
                    <TransactionItem data={t} key={t.id} />
                  ))}
                  {transactions.length === 0 && (
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

              <PaginationControl
                totalPages={metadata.totalPages}
                currentPage={metadata.currentPage}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
