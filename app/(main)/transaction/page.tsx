import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "取引一覧",
  description:
    "収入・支出の履歴を検索・フィルタ・ソート。取引データの一元管理と新規記録。",
};

import { getCategories } from "@/app/actions/category/get";
import { getStores } from "@/app/actions/store/get";
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

  const [transactionsData, categories, stores] = await Promise.all([
    getTransaction(initialPage, currentMonth),
    getCategories(),
    getStores(),
  ]);

  const { data: transactions, metadata } = transactionsData;
  return (
    <TransactionPageView
      transactions={transactions}
      metadata={metadata}
      currentMonth={currentMonth}
      categories={categories}
      stores={stores}
    />
  );
}
