import { format } from "date-fns";
import { getTransaction } from "@/app/actions/get-transaction";
import { TransactionList } from "@/components/transaction-list";

interface TransactionsPage {
  searchParams: { month?: string };
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPage) {
  const params = await searchParams;
  const initialPage = 1;
  const now = new Date();
  const defaultMonth = format(now, "yyyy-MM");
  const currentMonth = params.month || defaultMonth;
  // データ取得
  const transactionsData = await getTransaction(initialPage, currentMonth);

  const { data: transactions, metadata } = transactionsData;
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10 space-y-8 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold">取引一覧</h1>
        <p className="text-muted-foreground mt-2">
          日々の収支履歴を確認・管理します
        </p>
      </div>

      <TransactionList
        initialData={transactions}
        initialMetadata={metadata}
        currentMonth={currentMonth}
      />
    </main>
  );
}
