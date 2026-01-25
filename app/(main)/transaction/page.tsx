import { format } from "date-fns";
import { getCategories } from "@/app/actions/category/get";
import { getTransaction } from "@/app/actions/transaction/get";
import { TransactionPageView } from "@/components/features/transaction/transaction-page-view";

interface TransactionsPage {
  searchParams: { month?: string };
}

export default async function TransactionPage({
  searchParams,
}: TransactionsPage) {
  const params = await searchParams;
  const initialPage = 1;
  const now = new Date();
  const defaultMonth = format(now, "yyyy-MM");
  const currentMonth = params.month || defaultMonth;
  // データ取得
  const [transactionsData, categories] = await Promise.all([
    getTransaction(initialPage, currentMonth), // リスト用 (10件)
    getCategories(), // カテゴリ一覧
  ]);

  const { data: transactions, metadata } = transactionsData;
  return (
    <TransactionPageView
      transactions={transactions}
      metadata={metadata}
      currentMonth={currentMonth}
      categories={categories}
    />
  );
}
