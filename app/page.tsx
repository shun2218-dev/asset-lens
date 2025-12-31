import { format } from "date-fns";
import { desc } from "drizzle-orm";
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

export default async function Home() {
  // データの取得 (作成日時の降順)
  const transactionList = await db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.date))
    .limit(10);

  return (
    <main className="container mx-auto p-4 max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold">AssetLens</h1>

      <Card>
        <CardHeader>
          <CardTitle>新規入力</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm />
        </CardContent>
      </Card>

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
              {transactionList.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{format(t.date, "MM/dd")}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell className="text-right">
                    ¥{t.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {transactionList.length === 0 && (
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
    </main>
  );
}
